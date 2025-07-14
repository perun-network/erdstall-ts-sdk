"use strict";


import {
	LedgerEventHandlers,
	LedgerEventEmitters,
	EnclaveEventHandlers,
	EnclaveEventEmitters,
	LedgerEventMask
} from "./event";
import {
	Signer,
	Address,
	SignedMessage,
	SigVerifier,
	AddressType,
	Crypto
} from "#erdstall/crypto";
import { EthereumSigner, EthereumAddress } from "#erdstall/crypto/ethereum";
import { SubstrateSigner, SubstrateAddress } from "#erdstall/crypto/substrate";
import {
	AESGCMKey,
	WildcardAddress,
	InitVector
} from "#erdstall/crypto/wildcard";
import { ClientConfig } from "#erdstall/api/responses";
import { GetAccount, GetAccount_Output } from "#erdstall/api/calls";
import {
	NoNonceCheck,
	SignedTransaction,
	TxCore
} from "#erdstall/api/transactions";
import { CodecWriter } from "#erdstall/utils";
import { Enclave, EnclaveEvent } from "#erdstall/enclave";
import { Chain, Account, LedgerEvent, getChainName } from "#erdstall/ledger";
import { LocalAsset, ChainAssets } from "#erdstall/ledger/assets";
import { EthereumChainConfig } from "#erdstall/ledger/backend/ethereum/chainconfig";
import { SubstrateChainConfig } from "#erdstall/ledger/backend/substrate/chainconfig";


// Private state that gets injected by the deriving class, so that both the parent and the child class can access it but hide it via native #access protection. We do not want malicious code to be able to meddle with our internal state.
export class AppInternals implements SigVerifier {
	enclave?: Enclave;
	initialized: boolean = false;

	l2_emitters = new EnclaveEventEmitters;
	l2 = new EnclaveEventHandlers(this.l2_emitters);

	init_handler?: (cfg: ClientConfig) => void = undefined;
	config?: ClientConfig;

	identity?: L2Identity;

	constructor(
		identity?: L2Identity,
		init_handler?: (cfg: ClientConfig) => void)
	{
		this.identity = identity;
		this.init_handler = init_handler;
	}

	// Verify an incoming message signed by the enclave.
	async verifySig(sig: SignedMessage): Promise<Uint8Array | undefined> {
		// Do not accept unsigned messages from the enclave.
		if(sig.signature === undefined)
			return undefined;

		if(sig.signature instanceof InitVector) {
			return await this.identity?.encryption?.verifySig(sig);
		} else {
			let pk = this.config?.enclaveNativeSigner;
			return await (pk as any as SigVerifier).verifySig(sig);
		}
	}
}

// L2 Identity: addresses, signers, account ID and encryption.
// TODO: move this somewhere else maybe? crypto? ledger?
// TODO: what is the exact security model here? Some transactions want to modify state in here. => might have to re-think the encapsulation.
export class L2Identity {
	#wildcardId?: WildcardAddress;
	#encryption?: AESGCMKey;
	#eth?: EthereumSigner | EthereumAddress;
	#subst?: SubstrateSigner | SubstrateAddress;

	set aes(v: AESGCMKey | undefined) { this.#encryption = v; }

	set wildcardId(w: WildcardAddress) { this.#wildcardId = w; }

	constructor(
		wildcard: WildcardAddress | undefined,
		encryption: AESGCMKey | undefined, v?: {
		eth: EthereumSigner | EthereumAddress | undefined,
		subst: SubstrateSigner | SubstrateAddress | undefined
	})
	{
		this.#wildcardId = wildcard;
		this.#encryption = encryption;
		this.#eth = v?.eth;
		this.#subst = v?.subst;

		if(!wildcard && !v?.eth && !v?.subst)
			throw new Error("Empty L2 identity is illegal");
	}

	l1_signer_for(c: Crypto): Signer | undefined {
		switch(c) {
		case "ethereum":
			return (this.#eth instanceof EthereumSigner) ? this.#eth : undefined;
		case "substrate":
			return (this.#subst instanceof SubstrateSigner) ? this.#subst : undefined;
		}
		return undefined;
	}

	get address(): Address
		{ return (this.wildcard_addr ?? this.eth_addr ?? this.subst_addr)!; }
	get any_signer(): Signer | undefined {
		if(this.#eth instanceof EthereumSigner)
			return this.#eth;
		else if(this.#subst instanceof SubstrateSigner)
			return this.#subst;
		else return undefined;
	}

	get has_aes(): boolean { return this.#encryption !== undefined }
	get has_auth(): boolean
		{ return this.has_aes || this.any_signer !== undefined; }

	// Returns an encryption, or undefined if we do not have encryption.
	async encrypt(
		v: Uint8Array
	): Promise<{iv: InitVector, ciphertext: Uint8Array} | undefined>
		{ return await this.#encryption?.encrypt({message: v}); }

	// Returns undefined if we have no encryption. Throws if the encryption is invalid.
	async decrypt(v: {
		v: Uint8Array,
		iv: InitVector
	}): Promise<Uint8Array | undefined>
	{
		return await this.#encryption?.decrypt({
			ciphertext: v.v,
			additionalData: undefined,
			iv: v.iv,
		});
	}


	// TODO: Does this need hardening?
	set encryption(key: AESGCMKey) { this.#encryption = key; }
	set eth(v: EthereumSigner | EthereumAddress) { this.#eth = v; }
	set subst(v: SubstrateSigner | SubstrateAddress) { this.#subst = v; }


	get eth_addr(): EthereumAddress | undefined {
		if(this.#eth instanceof EthereumSigner)
			return this.#eth.address();
		else if(this.#eth instanceof EthereumAddress)
			return this.#eth;
		else return undefined;
	}

	get subst_addr(): SubstrateAddress | undefined {
		if(this.#subst instanceof SubstrateSigner)
			return this.#subst.address();
		else if(this.#subst instanceof SubstrateAddress)
			return this.#subst;
		else return undefined;
	}
	get wildcard_addr(): WildcardAddress | undefined { return this.#wildcardId; }


	async signForEnclave<T>(encoding: Uint8Array): Promise<SignedMessage<T>> {
		if(!this.has_auth)
			throw new Error("Identity does not have any authentication mechanism");

		if(this.has_aes)
		{
			let {iv, ciphertext} = await this.#encryption!.encrypt({
				message: encoding,
				additionalData: undefined
			});
			return new SignedMessage<T>(ciphertext, iv);
		} else
		{
			return new SignedMessage<T>(
				encoding,
				await this.any_signer!.sign(encoding));
		}
	}
}

// L2-only read-only client.
export class App {
	get config(): ClientConfig | undefined
		{ return this.#internals.config?.clone(); }

	get initialized() { return this.#internals.initialized; }

	get chainTypes(): Map<Chain, string>
	{
		return new Map<Chain, string>(
			this.#internals.config!.chains.map(
				cfg => [cfg.id, cfg.data.type()]));
	}

	// allow subscribing once to all chains, not individual chains?
	get l2_events(): EnclaveEventHandlers
		{ return new EnclaveEventHandlers(this.#internals.l2_emitters); }

	#internals: AppInternals;

	get #enclave() { return this.#internals.enclave!; }

	constructor(
		enclaveConn: (Enclave) | URL,
		internals?: AppInternals)
	{
		internals ??= new AppInternals();
		this.#internals = internals;

		if(enclaveConn instanceof URL)
			this.#internals.enclave = Enclave.dial(enclaveConn);
		else if(enclaveConn instanceof Enclave)
			this.#internals.enclave = enclaveConn;

		// one-time setter. Throws if the user tampered with it.
		this.#enclave.emitters = [this.#internals.l2_emitters, this.#internals];
	}


	async subscribe(who?: Address): Promise<void>
		{ return await this.#enclave.subscribe(who); }

	async fetchBalanceOf(who: Address): Promise<ChainAssets | undefined>
	{
		let tx = new GetAccount(
			new TxCore(who, new NoNonceCheck(), false),
			undefined,
			"only_if_plaintext");
		let result = await this.#enclave.getAccount(tx.unsigned()).result;
		return (await tx.decrypt_output(result)).balances;
	}

	/*async attest(): Promise<AttestationResult>
		{ return await this.#enclave.attest(); }*/

	initialize(timeout?: number): Promise<this> {
		return new Promise((resolve, reject) => {
			const rejectTimeout = setTimeout(
				reject,
				timeout ? timeout! : 15_000,
			);

			this.#internals.l2.error.once(reject);
			this.#internals.l2.config.once((config: ClientConfig) => {
				this.#internals.config = config;

				this.#internals.init_handler?.(config);

				clearTimeout(rejectTimeout);
				this.#internals.initialized = true;
				resolve(this);
			});
			this.#enclave.connect();
		});
	}

	disconnect(): void {
		this.#internals.initialized = false;
		this.#enclave.disconnect();
	}
}
