// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	LedgerEventHandlers,
	LedgerEventEmitters,
	EnclaveEventHandlers,
	EnclaveEventEmitters,
	LedgerEventMask
} from "./event";
import { Address } from "#erdstall/crypto";
import { AttestationResult, ClientConfig, ChainConfig } from "#erdstall/api/responses";
import { Enclave, EnclaveEvent } from "#erdstall/enclave";
import { Chain, Account, LedgerEvent, getChainName } from "#erdstall/ledger";
import { LocalAsset } from "#erdstall/ledger/assets";
import { ethers, Signer } from "ethers";

import { App, AppInternals } from "./app";

export type BackendClientConstructors = {
	ethereum?: {
		initializer: (config: ChainConfig) => ChainClient;
	};
	substrate?: {
		initializer: (config: ChainConfig) => ChainClient;
	};
};

export abstract class ChainClient {
	abstract update_event_tracking(mask: LedgerEventMask): void;
}

// The Erdstall multi-client. It is a convenience client giving a uniform
// interface for all backends requested.
export class Client extends App
{
	#internals: AppInternals;
	#clients = new Map<Chain, ChainClient>();
	#blockchainReadCtors: BackendClientConstructors;
	#l1_event_emitters = new LedgerEventEmitters;
	#internal_l1_events: LedgerEventHandlers;
	get l1_events(): LedgerEventHandlers
		{ return new LedgerEventHandlers(this.#l1_event_emitters); }

	get #enclave() { return this.#internals.enclave!; }

	constructor(
		enclaveConn: (Enclave) | URL,
		blockchainReadCtors: BackendClientConstructors,
	) {
		const internals = new AppInternals((cfg) => this.#on_config(cfg));
		super(enclaveConn, internals);
		this.#internals = internals;

		// Allow creating a client without any backend arguments. Eases
		// implementation of ErdstallSessions.
		this.#blockchainReadCtors = blockchainReadCtors;

		this.#internal_l1_events =
			new LedgerEventHandlers(this.#l1_event_emitters);
	}

	#on_config(config: ClientConfig): void
	{
		for(const chainCfg of config.chains)
		{
			if(!this.#blockchainReadCtors?.[chainCfg.data.type() as ("ethereum" | "substrate")]?.initializer)
			{
				console.warn(`No backend configured for ${
					getChainName(chainCfg.id)
				} (${
					chainCfg.data.type()
				}): not creating a chain client.`);
				continue;
			}
			
			const ctor =
				(this.#blockchainReadCtors as any)[chainCfg.data.type()]!;
			this.#clients.set(
				chainCfg.id,
				(ctor.initializer! as unknown as any)(chainCfg.data));
		}

		// Track requested events on all clients.
		let mask = this.#l1_event_emitters.subscription_mask();
		for (const [_, client] of this.#clients)
			client.update_event_tracking(mask);
	}
}
