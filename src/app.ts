"use strict";


import {
	LedgerEventHandlers,
	LedgerEventEmitters,
	EnclaveEventHandlers,
	EnclaveEventEmitters,
	LedgerEventMask
} from "./event";
import { Address } from "#erdstall/crypto";
import { AttestationResult, ClientConfig } from "#erdstall/api/responses";
import { Enclave, EnclaveEvent } from "#erdstall/enclave";
import { Chain, Account, LedgerEvent, getChainName } from "#erdstall/ledger";
import { LocalAsset } from "#erdstall/ledger/assets";
import { EthereumChainConfig } from "#erdstall/ledger/backend/ethereum/chainconfig";
import { SubstrateChainConfig } from "#erdstall/ledger/backend/substrate/chainconfig";
import { ethers, Signer } from "ethers";


// Private state that gets injected by the deriving class, so that both the parent and the child class can access it but hide it via native #access protection. We do not want malicious code to be able to meddle with our internal state.
export class AppInternals {
	enclave?: Enclave;
	initialized: boolean = false;

	l2_emitters = new EnclaveEventEmitters;
	l2 = new EnclaveEventHandlers(this.l2_emitters);

	init_handler?: (cfg: ClientConfig) => void = undefined;
	config?: ClientConfig;

	constructor(init_handler?: (cfg: ClientConfig) => void)
		{ this.init_handler = init_handler; }

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
		this.#enclave.emitters = this.#internals.l2_emitters;
	}


	async subscribe(who?: Address): Promise<void>
		{ return await this.#enclave.subscribe(who); }

	async getAccount(who: Address): Promise<Account> {
		return (await this.#enclave.getAccount(who)).account;
	}

	async attest(): Promise<AttestationResult>
		{ return await this.#enclave.attest(); }

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
