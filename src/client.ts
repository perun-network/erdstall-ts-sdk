// SPDX-License-Identifier: Apache-2.0
"use strict";

import { InternalEnclaveWatcher } from "./internalenclavewatcher";
import { ErdstallEvent, ErdstallEventHandler, EnclaveEvent } from "./event";
import {
	ErdstallClient,
	ErdstallBackendClient,
	BackendAddress,
} from "./erdstall";
import * as crypto from "#erdstall/crypto";
import { AttestationResult, ClientConfig } from "#erdstall/api/responses";
import { Enclave, isEnclaveEvent, EnclaveReader } from "#erdstall/enclave";
import { Chain, Account, isLedgerEvent, LedgerEvent } from "#erdstall/ledger";
import { LocalAsset } from "#erdstall/ledger/assets";
import { Backend } from "#erdstall/ledger/backend";
import { BackendChainConfig } from "#erdstall/ledger/backend/backends";
import { EthereumClient } from "#erdstall/ledger/backend/ethereum";
import { SubstrateClient } from "#erdstall/ledger/backend/substrate";
import { ethers, Signer } from "ethers";
import { EventCache, OneShotEventCache } from "#erdstall/utils";

export type BackendClientConstructors = {
	ethereum?: {
		backend: "ethereum";
		initializer: (config: BackendChainConfig<"ethereum">) => EthereumClient;
	};
	substrate?: {
		backend: "substrate";
		initializer: (config: BackendChainConfig<"substrate">) => SubstrateClient;
	};
	test?: {
		backend: "test";
		initializer: (config: BackendChainConfig<"test">) => ErdstallBackendClient<"test">;
	};
};

// The Erdstall multi-client. It is a convenience client giving a uniform
// interface for all backends requested.
export class Client<Bs extends Backend[]> implements ErdstallClient<Bs> {
	protected erdstallEventHandlerCache: EventCache<LedgerEvent, Bs[number]>;
	protected erdstallOneShotHandlerCache: OneShotEventCache<
		LedgerEvent,
		Bs[number]
	>;

	protected clients: Map<number, ErdstallBackendClient<Bs[number]>>;
	protected enclaveConn: EnclaveReader & InternalEnclaveWatcher;
	protected initialized: boolean = false;

	private blockchainReadCtors: BackendClientConstructors;

	#config?: ClientConfig;

	get config(): ClientConfig | undefined { return this.#config?.clone(); }
	get chainTypes() {
		return new Map<Chain, string>(
			this.#config!.chains.map(cfg => [cfg.id, cfg.type]));
	}


	constructor(
		enclaveConn: (EnclaveReader & InternalEnclaveWatcher) | URL,
		blockchainReadCtors: BackendClientConstructors,
	) {
		if (enclaveConn! instanceof URL)
		{
			this.enclaveConn = Enclave.dial(
				enclaveConn as URL,
			) as EnclaveReader & InternalEnclaveWatcher;
		}
		else this.enclaveConn = enclaveConn;

		this.clients = new Map();

		// Allow creating a client without any backend arguments. Eases
		// implementation of ErdstallSessions.
		this.blockchainReadCtors = blockchainReadCtors;

		this.erdstallEventHandlerCache = new EventCache<
			LedgerEvent,
			Bs[number]
		>();
		this.erdstallOneShotHandlerCache = new OneShotEventCache<
			LedgerEvent,
			Bs[number]
		>();
	}

	erdstall() {
		const res = Array.from(this.clients.entries()).map(([_chain, client]) =>
			client.erdstall(),
		);
		if (res.length == 1) {
			return res[0] as any;
		} else {
			return res as any;
		}
	}

	protected on_internal<T extends EnclaveEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, Bs[number]>,
	): void {
		return this.enclaveConn.on_internal(ev, cb);
	}

	protected off_internal<T extends EnclaveEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, Bs[number]>,
	): void {
		return this.enclaveConn.off_internal(ev, cb);
	}

	on<T extends ErdstallEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, Bs[number]>,
	): void {
		if (isLedgerEvent(ev)) {
			if (!this.initialized) {
				this.erdstallEventHandlerCache.set(
					ev,
					cb as ErdstallEventHandler<typeof ev, Bs[number]>,
				);
			}

			this.clients.forEach((client) =>
				client.on(
					ev,
					cb as ErdstallEventHandler<typeof ev, Bs[number]>,
				),
			);
		} else if (isEnclaveEvent(ev)) {
			return this.enclaveConn.on(
				ev,
				cb as ErdstallEventHandler<typeof ev, never>,
			);
		} else {
			const exhaustiveCheck: never = ev;
			throw new Error(`unhandled eventtype: ${exhaustiveCheck}`);
		}
	}

	protected once_internal<T extends EnclaveEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, Bs[number]>,
	): void {
		return this.enclaveConn.once_internal(ev, cb);
	}

	once<T extends ErdstallEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, Bs[number]>,
	): void {
		if (isLedgerEvent(ev)) {
			if (!this.initialized) {
				this.erdstallOneShotHandlerCache.set(
					ev,
					cb as ErdstallEventHandler<typeof ev, Bs[number]>,
				);
			}

			this.clients.forEach((client) =>
				client.once(
					ev,
					cb as ErdstallEventHandler<typeof ev, Bs[number]>,
				),
			);
		} else if (isEnclaveEvent(ev)) {
			return this.enclaveConn.once(
				ev,
				cb as ErdstallEventHandler<typeof ev, never>,
			);
		} else {
			// Happens statically in TS and also throws an error when used as a JS lib.
			const exhaustiveCheck: never = ev;
			throw new Error(`unhandled eventtype: ${exhaustiveCheck}`);
		}
	}

	off<T extends ErdstallEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, Bs[number]>,
	): void {
		if (isLedgerEvent(ev)) {
			this.clients.forEach((client) =>
				client.off(
					ev,
					cb as ErdstallEventHandler<typeof ev, Bs[number]>,
				),
			);
		} else if (isEnclaveEvent(ev)) {
			return this.enclaveConn.off(
				ev,
				cb as ErdstallEventHandler<typeof ev, never>,
			);
		} else {
			// Happens statically in TS and also throws an error when used as a JS lib.
			const exhaustiveCheck: never = ev;
			throw new Error(`unhandled eventtype: ${exhaustiveCheck}`);
		}
	}

	removeAllListeners(): void {
		this.enclaveConn.removeAllListeners();
		this.clients.forEach((client) => client.removeAllListeners());
		this.erdstallEventHandlerCache.clear();
		this.erdstallOneShotHandlerCache.clear();
	}

	async subscribe(who?: crypto.Address<crypto.Crypto>): Promise<void> {
		return this.enclaveConn.subscribe(who);
	}

	async getAccount(who: BackendAddress<Backend>): Promise<Account> {
		return (await this.enclaveConn.getAccount(who)).account;
	}

	async attest(): Promise<AttestationResult> {
		return await this.enclaveConn.attest();
	}

	private defaultOnConfigHandler: ErdstallEventHandler<"config", Bs[number]> =
		(config: ClientConfig) => {
			for(const chainCfg of config.chains)
			{
				if(!this.blockchainReadCtors.hasOwnProperty(chainCfg.type))
				{
					console.warn(`No backend configured for ${
						chainCfg.type
					} chain <${
						chainCfg.id
					}>: not creating a backend client.`);
					continue;
				}
				
				const ctor = this.blockchainReadCtors[chainCfg.type]!;
				this.clients.set(
					chainCfg.id,
					(ctor.initializer as unknown as any)(chainCfg.data));
			}

			// Forward all cached events to respective clients.
			for (const [_, client] of this.clients) {
				for (const [ev, cbs] of this.erdstallEventHandlerCache) {
					cbs.forEach((cb) => client.on(ev, cb));
				}

				for (const [ev, cbs] of this.erdstallOneShotHandlerCache) {
					cbs.forEach((cb) => client.once(ev, cb));
				}
			}
		};

	initialize(
		timeout?: number,
		onConfigHandler: ErdstallEventHandler<"config", Bs[number]> = this
			.defaultOnConfigHandler,
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const rejectTimeout = setTimeout(
				reject,
				timeout ? timeout! : 15_000,
			);

			this.enclaveConn.once("error", reject);
			this.enclaveConn.once("config", (config: ClientConfig) => {
				this.#config = config;

				onConfigHandler(config);

				this.erdstallOneShotHandlerCache.clear();
				this.erdstallEventHandlerCache.clear();

				clearTimeout(rejectTimeout);
				this.enclaveConn.off("error", reject);
				this.initialized = true;
				resolve();
			});
			this.enclaveConn.connect();
		});
	}

	disconnect(): void {
		this.initialized = false;
		this.enclaveConn.disconnect();
	}
}
