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
import { Account, isLedgerEvent, LedgerEvent } from "#erdstall/ledger";
import { Backend } from "#erdstall/ledger/backend";
import { EthereumClient } from "#erdstall/ledger/backend/ethereum";
import { SubstrateClient } from "#erdstall/ledger/backend/substrate";
import { ethers, Signer } from "ethers";
import { NFTMetadata } from "#erdstall/ledger/backend";
import { EventCache, OneShotEventCache } from "#erdstall/utils";

export type BackendClientConstructors = {
	ethereum: {
		backend: "ethereum";
		provider: ethers.providers.Provider | Signer;
		initializer: (
			config: ClientConfig,
			provider: ethers.providers.Provider | Signer,
		) => EthereumClient;
	};
	substrate: {
		backend: "substrate";
		arg: number;
		initializer: (config: ClientConfig) => SubstrateClient;
	};
	test: {
		backend: "test";
	};
};

// ConstructorArgs creates a type-level tuple of the backends constructors
// used with this client.
export type ConstructorArgs<Bs extends Backend[]> = Bs extends [
	infer Head,
	...infer Rest,
]
	? Head extends Backend
		? Rest extends Backend[]
			? [BackendClientConstructors[Head], ...ConstructorArgs<Rest>]
			: never
		: never
	: [];

// createClient is a wrapper for different backend constructors.
function createClient<Bs extends Backend[]>(
	config: ClientConfig,
	backendCtor: BackendClientConstructors[keyof BackendClientConstructors],
): ErdstallBackendClient<Bs[number]> {
	switch (backendCtor.backend) {
		case "ethereum":
			return backendCtor.initializer(config, backendCtor.provider);
		case "substrate":
			return new SubstrateClient(backendCtor.arg);
		case "test":
			throw new Error("test backend not implemented");
	}
}

// The Erdstall multi-client. It is a convenience client giving a uniform
// interface for all backends requested.
export class Client<Bs extends Backend[]> implements ErdstallClient<Bs> {
	protected erdstallEventHandlerCache: EventCache<LedgerEvent, Bs[number]>;
	protected erdstallOneShotHandlerCache: OneShotEventCache<
		LedgerEvent,
		Bs[number]
	>;

	protected clients: Map<Bs[number], ErdstallBackendClient<Bs[number]>>;
	protected enclaveConn: EnclaveReader & InternalEnclaveWatcher;
	protected initialized: boolean = false;

	// TODO: Note that this has to be maintained with the Session
	// implementation. If possible, lift this to compile time.
	private clientArgs: ConstructorArgs<Bs>;

	constructor(
		enclaveConn: (EnclaveReader & InternalEnclaveWatcher) | URL,
		...args: ConstructorArgs<Bs>
	) {
		if (enclaveConn! instanceof URL)
			this.enclaveConn = Enclave.dial(
				enclaveConn as URL,
			) as EnclaveReader & InternalEnclaveWatcher;
		else this.enclaveConn = enclaveConn;

		this.clients = new Map();

		// Allow creating a client without any backend arguments. Eases
		// implementation of ErdstallSessions.
		this.clientArgs = args;

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

	getNftMetadata(
		backend: Bs[number],
		token: BackendAddress<Backend>,
		id: bigint,
		useCache?: boolean,
	): Promise<NFTMetadata> {
		return this.clients
			.get(backend)!
			.getNftMetadata(backend, token, id, useCache);
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
		(config) => {
			// Construct all requested clients.
			for (const backendCtor of this.clientArgs) {
				const client = createClient(config, backendCtor);
				let _backendCtor = backendCtor as { backend: Bs[number] };
				this.clients.set(_backendCtor.backend, client);
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
}
