// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	BalanceProof,
	ChainProof,
	ChainProofChunk,
	ClientConfig,
	DirectTxReceipt,
	SignedDirectTxReceipt,
	PublicTxReceipt,
	SignedPublicTxReceipt,
} from "#erdstall/api/responses";
import {
	StrictNonceCheck,
	NoNonceCheck,
	SignedTransaction,
	Transaction,
	TxCore,
	Transfer,
	Mint,
	FullExit,
	Burn,
	SetPrivacy,
	LinkAccount,
	LinkAccount_Output,
	GetAccount,
} from "#erdstall/api/transactions";
import { Account, Chain, getChainName } from "#erdstall/ledger";
import { ChainAssets, Asset } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import * as crypto from "#erdstall/crypto";
import { Signer, Address, AddressType } from "#erdstall/crypto";
import { EthereumSigner, EthereumAddress } from "#erdstall/crypto/ethereum";
import { SubstrateSigner, SubstrateAddress } from "#erdstall/crypto/substrate";
import { AESGCMKey, DHPair, WildcardAddress } from "#erdstall/crypto/wildcard";
import { LedgerEventEmitters, LedgerEventHandlers } from "./event";
import { Enclave, EnclaveEvent, CallResponse } from "#erdstall/enclave";
import { PendingTransaction } from "./api/util/pending_transaction";
import { ChainConfig } from "#erdstall/api/responses";
import { CodecWriter } from "#erdstall/utils";

import { App, AppInternals, L2Identity } from "./app";

import {
	UnsignedTxBatch,
	UnsignedTx,
	SignedTxBatch,
	SignedTx,
	TxReceiptBatch,
	TxReceipt,
} from "#erdstall/ledger/backend";

export const ErrUnitialisedClient = new Error("client unitialised");

export abstract class ChainSession {
	abstract withdraw(
		epoch: bigint,
		exitProof: ChainProofChunk[],
	): Promise<UnsignedTxBatch>;

	abstract deposit(assets: ChainAssets): Promise<UnsignedTxBatch>;

	abstract signTx(tx: UnsignedTx): Promise<SignedTx>;
	abstract signTxBatch(txs: UnsignedTxBatch): Promise<SignedTxBatch>;

	abstract sendTx(tx: SignedTx): Promise<TxReceipt>;
	abstract sendTxBatch(txs: SignedTxBatch): Promise<TxReceiptBatch>;
}

export type BackendSessionConstructors = {
	ethereum?: {
		type: "ethereum";
		initializer: (
			config: ChainConfig,
			signer: EthereumSigner,
			events: LedgerEventEmitters,
		) => ChainSession;
	};
	substrate?: {
		type: "substrate";
		initializer: (
			config: ChainConfig,
			signer: SubstrateSigner,
			events: LedgerEventEmitters,
		) => ChainSession;
	};
};

// L2-only read-write client that is associated with an L2 account.
export class WritingApp extends App {
	// L2 signing and nonce tracking.
	#internals: AppInternals;

	// Start with an invalid nonce, so that it will be queried anew upon its next use.
	#nonce: bigint = 0n;
	#updatingNonce?: Promise<any>;

	get #enclave() {
		return this.#internals.enclave!;
	}
	get address(): Address {
		return this.#internals.identity!.address;
	}
	get eth_addr(): EthereumAddress | undefined {
		return this.#internals.identity!.eth_addr;
	}
	get subst_addr(): SubstrateAddress | undefined {
		return this.#internals.identity!.subst_addr;
	}
	get wildcard_addr(): WildcardAddress | undefined {
		return this.#internals.identity!.wildcard_addr;
	}

	constructor(
		enclaveConn: Enclave | URL,
		internals: L2Identity | AppInternals,
	) {
		if (internals instanceof L2Identity)
			internals = new AppInternals(internals);
		if (!internals.identity!.has_auth)
			throw new Error("Wildcard identity needs an authentication mechanism");
		super(enclaveConn, internals);

		this.#internals = internals;
		this.#internals.l2.error.on(() => {
			this.#nonce = 0n;
		});
	}

	// Returns the encoding of the signed transaction.
	async #signTx<Tx extends Transaction>(
		tx: Tx,
	): Promise<SignedTransaction<Tx>> {
		let id = this.#internals.identity!;
		let w = new CodecWriter();
		tx.encodePayload(w);
		let signedMsg = await id.signForEnclave<Tx>(w.get());
		return new SignedTransaction(id.address, signedMsg);
	}

	async transferTo(
		assets: ChainAssets,
		to: Address,
	): Promise<CallResponse<void>> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = new StrictNonceCheck(await this.#nextNonce());
		const tx = new Transfer(new TxCore(this.address, nonce, false), to, assets);
		return this.#enclave.transfer(await this.#signTx(tx));
	}

	async mint(token: Uint8Array, amount: Asset): Promise<CallResponse<void>> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = new StrictNonceCheck(await this.#nextNonce());
		const tx = new Mint(
			new TxCore(this.address, nonce, false),
			token as Uint8Array & { length: 32 },
			amount,
		);
		let signed = await this.#signTx(tx);
		return this.#enclave.mint(signed);
	}

	async burn(assets: ChainAssets): Promise<CallResponse<void>> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}

		const nonce = new StrictNonceCheck(await this.#nextNonce());
		const tx = new Burn(new TxCore(this.address, nonce, false), assets);
		return this.#enclave.burn(await this.#signTx(tx));
	}

	async exit(chain?: number): Promise<BalanceProof> {
		if (!this.initialized) {
			return Promise.reject(ErrUnitialisedClient);
		}

		let nonce = new StrictNonceCheck(await this.#nextNonce());
		const exittx = new FullExit(
			new TxCore(this.address, nonce, false),
			chain ?? 0,
		);
		let { response, proof } = this.#enclave.exit(await this.#signTx(exittx));
		await response.result;
		return proof;
	}

	// Queries the next nonce and increases the counter. If the nonce has an
	// invalid value, queries the current nonce from the enclave. This function
	// can be called concurrently.
	async #nextNonce(): Promise<bigint> {
		if (!this.#nonce) {
			await this.updateNonce();
		}

		return this.#nonce++;
	}

	async #updateNonceInternal(): Promise<void> {
		let tx = new GetAccount(
			new TxCore(this.address, new NoNonceCheck(), true),
			undefined,
			undefined,
		);
		const acc = await this.#enclave.getAccount(tx.unsigned()).result;
		if (!this.#nonce) {
			this.#nonce = acc.nonce + 1n;
		}
	}

	// Fetches the current nonce from the enclave. Only overwrites the nonce if
	// it has an invalid value, so this function can be called concurrently.
	async updateNonce(): Promise<void> {
		if (this.#updatingNonce) return this.#updatingNonce;
		this.#updatingNonce = this.#updateNonceInternal();
		try {
			await this.#updatingNonce;
		} finally {
			// make sure it always clears out properly...
			this.#updatingNonce = undefined;
		}
	}

	async subscribeSelf(): Promise<void> {
		return this.#enclave.subscribe(this.address);
	}

	// Link all keys in the current L2 Identity together.
	async linkAccount(
		eth: EthereumSigner | undefined,
		subst: SubstrateSigner | undefined,
		accountID: WildcardAddress | "create account ID",
	): Promise<CallResponse<LinkAccount_Output>> {
		const nonce = new StrictNonceCheck(await this.#nextNonce());
		let tx = new LinkAccount(
			new TxCore(this.address, nonce, false),
			eth?.address(),
			subst?.address(),
			accountID,
		);

		await tx.authorise_link(eth, subst);

		return this.#enclave.linkAccount(await this.#signTx(tx)).map(async (r) => {
			this.#internals.identity!.wildcardId = r.accountID;
			return r;
		});
	}

	get hasEncryption(): boolean {
		return this.#internals.identity!.has_aes;
	}

	// Fetches the privacy key and remembers it. Returns whether we have a privacy key.
	async fetchPrivacyKey(): Promise<boolean> {
		let tx = new GetAccount(
			new TxCore(this.address, new NoNonceCheck(), true), // force plaintext receipt
			await DHPair.generate(),
			undefined,
		);

		let res = await this.#enclave.getAccount(await this.#signTx(tx)).result;
		if (res.id) this.#internals.identity!.wildcardId = res.id;
		let { sk } = await tx.decrypt_output(res);
		this.#internals.identity!.aes = sk;
		return sk !== undefined;
	}

	async setPrivacy(enabled: boolean): Promise<void> {
		const nonce = new StrictNonceCheck(await this.#nextNonce());
		let tx = new SetPrivacy(
			new TxCore(this.address, nonce, true),
			enabled ? await DHPair.generate() : undefined,
		);

		let result = this.#enclave.setPrivacy(await this.#signTx(tx)).result;
		this.#internals.identity!.aes = await tx.decrypt_output(await result);
	}

	// Will fail if you have a private account, but did not supply the privacy key to the session. In that case, you can fetch it via fetchPrivacyKey().
	async fetchOwnBalance(): Promise<ChainAssets | undefined> {
		let tx = new GetAccount(
			new TxCore(this.address, new NoNonceCheck(), false),
			undefined,
			this.#internals.identity!.has_aes ? "always" : "only_if_plaintext",
		);

		let result = await this.#enclave.getAccount(tx.unsigned()).result;
		let { balances } = await tx.decrypt_output(result);
		// PLEASE STOP simply stating that typescript should just assume something is not undefined!
		// The "!" operator does nothing if the value actually is undefined.
		return balances;
	}
}

export class Session extends WritingApp {
	#internals: AppInternals;

	get address(): Address {
		return this.#internals.identity!.address;
	}

	get #enclave() {
		return this.#internals.enclave!;
	}
	// Filled dynamically when we receive configs.
	#chains = new Map<Chain, ChainSession>();
	#blockchainWriteCtors: BackendSessionConstructors;

	// Event handling.
	#l1_event_emitters = new LedgerEventEmitters();
	#internal_l1_events: LedgerEventHandlers = new LedgerEventHandlers(
		this.#l1_event_emitters,
	);
	get l1_events(): LedgerEventHandlers {
		return new LedgerEventHandlers(this.#l1_event_emitters);
	}

	constructor(
		enclaveConn: Enclave | URL,
		identity: L2Identity,
		backendCtors: BackendSessionConstructors,
	) {
		const internals = new AppInternals(identity, (cfg) => this.#on_config(cfg));
		super(enclaveConn, internals);
		this.#internals = internals;

		this.#blockchainWriteCtors = backendCtors;
	}

	async leave(
		chain?: number,
		notify?: (message: string, stage: number, maxStages: number) => void,
	): Promise<Map<number, UnsignedTxBatch>> {
		let skipped = 0;
		let atStage = 1;
		let maxStages = 3;
		const sealed = new Promise<void>((accept) => {
			let cb = () => {
				// One Epoch when the current epoch ends for which we receive the ExitProof. (Challenge duration)
				// One further epoch: response duration.
				// One more epoch: Freeze enactment / propagation.
				if (skipped < 3) {
					skipped++;
				} else {
					this.#internals.l2.phaseshift.off(cb);
					accept();
				}
			};
			// NOTE IMPROVE: unreliable if we are at an epoch shift. We should get the epoch the transaction happened in as part of the TX receipt to be completely race-free. And then we want to await for the balance proofs etc. Also, instead of awaiting phaseshift events, we would rather wait for a timestamp according to our time. That way, the phaseshift event becomes more of a "we just persisted" notification or something, but no longer required for this kind of stuff.
			this.#internals.l2.phaseshift.on(cb);
		});
		notify?.("awaiting exit proof", atStage++, maxStages);
		// TODO: currently, this only really works for single-account subscriptions. We should add an address field to the message.
		const exitProof =
			await this.exit(chain); /*.accounts.get((this.address).key)!*/

		notify?.("awaiting epoch sealing", atStage++, maxStages);
		await sealed;
		notify?.("withdrawing", atStage++, maxStages);

		const transactions = new Map<number, UnsignedTxBatch>();
		for (const [address, chains] of exitProof.proofs.entries()) {
			for (let [chain, proofs] of chains.entries()) {
				chain = Number(chain);
				transactions.set(
					chain,
					await this.withdraw(chain, exitProof.epoch, proofs.exit),
				);
			}
		}
		return transactions;
	}

	async withdraw(
		chain: number,
		epoch: bigint,
		exitProof: ChainProofChunk[],
	): Promise<UnsignedTxBatch> {
		return this.#chains.get(chain)!.withdraw(epoch, exitProof);
	}

	async deposit(chain: number, asset: ChainAssets): Promise<UnsignedTxBatch> {
		return this.#chains.get(chain)!.deposit(asset);
	}

	async signTx(tx: UnsignedTx): Promise<SignedTx> {
		const chain = this.#chains.get(tx.chain);
		if (!chain)
			throw new Error(
				`Transaction is for unsupported chain ${getChainName(tx.chain)}`,
			);

		return await chain.signTx(tx);
	}

	async signTxBatch(txs: UnsignedTxBatch): Promise<SignedTxBatch> {
		const chain = this.#chains.get(txs.chain);
		if (!chain)
			throw new Error(
				`Transaction batch is for unsupported chain ${getChainName(txs.chain)}`,
			);

		return await chain.signTxBatch(txs);
	}

	async sendTx(tx: SignedTx): Promise<TxReceipt> {
		const chain = this.#chains.get(tx.chain);
		if (!chain)
			throw new Error(
				`Transaction is for unsupported chain ${getChainName(tx.chain)}`,
			);

		return await chain.sendTx(tx);
	}

	async sendTxBatch(txs: SignedTxBatch): Promise<TxReceiptBatch> {
		const chain = this.#chains.get(txs.chain);
		if (!chain)
			throw new Error(
				`Transaction batch is for unsupported chain ${getChainName(txs.chain)}`,
			);

		return await chain.sendTxBatch(txs);
	}

	#on_config(cfg: ClientConfig): void {
		// Construct all requested session backends.
		for (const chainCfg of cfg.chains) {
			if (!this.#blockchainWriteCtors.hasOwnProperty(chainCfg.data.type())) {
				console.warn(
					`No backend configured for ${chainCfg.data.type()} chain <${chainCfg.id
					}>: not creating a backend client.`,
				);
				continue;
			}
			let s = this.#internals.identity!.l1_signer_for(chainCfg.data.type());

			if (!s) {
				console.warn(
					`No compatible signer for ${chainCfg.data.type()} chain <${chainCfg.id
					}>: not creating a backend client.`,
				);
				continue;
			}

			const ctor = (this.#blockchainWriteCtors as any)[chainCfg.data.type()]!;
			this.#chains.set(
				chainCfg.id,
				(ctor.initializer as unknown as any)(
					chainCfg,
					s,
					this.#l1_event_emitters,
				) as ChainSession,
			);
		}
	}
}
