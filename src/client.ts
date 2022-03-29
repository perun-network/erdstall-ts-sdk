// SPDX-License-Identifier: Apache-2.0
"use strict";

import { InternalEnclaveWatcher } from "./internalenclavewatcher";
import { ErdstallEvent, ErdstallEventHandler, EnclaveEvent } from "./event";
import { ErdstallClient } from "./erdstall";
import { Erdstall__factory } from "#erdstall/ledger/backend/contracts";
import { ClientConfig } from "#erdstall/api/responses";
import { Enclave, isEnclaveEvent, EnclaveReader } from "#erdstall/enclave";
import {
	LedgerWriteConn,
	LedgerReader,
	LedgerWriter,
	Address,
	Account,
	LedgerEvent,
	isLedgerEvent,
} from "#erdstall/ledger";
import { TokenFetcher, TokenProvider } from "#erdstall/ledger/backend";
import { EventCache, OneShotEventCache } from "#erdstall/utils";
import { ethers, Signer } from "ethers";
import { NFTMetadata } from "#erdstall/ledger/backend";
import { OnChainQuerier } from "./ledger/onChainQuerier";
import { EthereumOnChainQuerier } from "./ledger/backend/ethereumOnChainQuerier";
import { Session } from "#erdstall";



export class Client implements ErdstallClient {
	readonly tokenProvider: TokenProvider;
	readonly onChainQuerier: OnChainQuerier;
	protected enclaveConn: EnclaveReader & InternalEnclaveWatcher;
	protected provider: ethers.providers.Provider | Signer;
	protected erdstallConn?: LedgerReader | LedgerWriter;
	private erdstallEventHandlerCache: EventCache<LedgerEvent>;
	private erdstallOneShotHandlerCache: OneShotEventCache<LedgerEvent>;

	constructor(
		provider: ethers.providers.Provider | Signer,
		encConn: (EnclaveReader & InternalEnclaveWatcher) | URL,
	) {
		this.provider = provider;
		if (encConn! instanceof URL)
			this.enclaveConn = Enclave.dial(encConn as URL) as EnclaveReader & InternalEnclaveWatcher;
		else this.enclaveConn = encConn;
		this.erdstallEventHandlerCache = new EventCache<LedgerEvent>();
		this.erdstallOneShotHandlerCache = new OneShotEventCache<LedgerEvent>();
		this.tokenProvider = new TokenFetcher();
		this.onChainQuerier = new EthereumOnChainQuerier(this.provider);
	}

	erdstall(): Address {
		return this.erdstallConn!.erdstall();
	}

	getNftMetadata(
		token: Address,
		id: bigint,
		useCache?: boolean,
	): Promise<NFTMetadata> {
		if (!this.erdstallConn) {
			throw new Error("client uninitialized");
		}
		return this.erdstallConn.getNftMetadata(token, id, useCache);
	}

	protected on_internal<T extends EnclaveEvent>(ev: T, cb: ErdstallEventHandler<T>): void {
		return this.enclaveConn.on_internal(
			ev,
			cb as ErdstallEventHandler<typeof ev>,
		);
	}

	protected off_internal<T extends EnclaveEvent>(ev: T, cb: ErdstallEventHandler<T>): void {
		return this.enclaveConn.off_internal(
			ev,
			cb as ErdstallEventHandler<typeof ev>,
		);
	}

	on<T extends ErdstallEvent>(ev: T, cb: ErdstallEventHandler<T>): void {
		if (isLedgerEvent(ev)) {
			if (this.erdstallConn) {
				this.erdstallConn.on(ev, cb as ErdstallEventHandler<typeof ev>);
			} else {
				this.erdstallEventHandlerCache.set(
					ev,
					cb as ErdstallEventHandler<typeof ev>,
				);
			}
		} else if (isEnclaveEvent(ev)) {
			return this.enclaveConn.on(
				ev,
				cb as ErdstallEventHandler<typeof ev>,
			);
		} else {
			const exhaustiveCheck: never = ev;
			throw new Error(`unhandled eventtype: ${exhaustiveCheck}`);
		}
	}

	protected once_internal<T extends EnclaveEvent>(ev: T, cb: ErdstallEventHandler<T>): void {
		return this.enclaveConn.once_internal(
			ev,
			cb as ErdstallEventHandler<typeof ev>,
		);
	}

	once<T extends ErdstallEvent>(ev: T, cb: ErdstallEventHandler<T>): void {
		if (isLedgerEvent(ev)) {
			if (this.erdstallConn) {
				this.erdstallConn.once(
					ev,
					cb as ErdstallEventHandler<typeof ev>,
				);
			} else {
				this.erdstallOneShotHandlerCache.set(
					ev,
					cb as ErdstallEventHandler<typeof ev>,
				);
			}
		} else if (isEnclaveEvent(ev)) {
			return this.enclaveConn.once(
				ev,
				cb as ErdstallEventHandler<typeof ev>,
			);
		} else {
			// Happens statically in TS and also throws an error when used as a JS lib.
			const exhaustiveCheck: never = ev;
			throw new Error(`unhandled eventtype: ${exhaustiveCheck}`);
		}
	}

	off<T extends ErdstallEvent>(ev: T, cb: ErdstallEventHandler<T>): void {
		if (isLedgerEvent(ev)) {
			if (!this.erdstallConn) {
				return;
			}
			this.erdstallConn.off(ev, cb as ErdstallEventHandler<typeof ev>);
		} else if (isEnclaveEvent(ev)) {
			return this.enclaveConn.off(
				ev,
				cb as ErdstallEventHandler<typeof ev>,
			);
		} else {
			// Happens statically in TS and also throws an error when used as a JS lib.
			const exhaustiveCheck: never = ev;
			throw new Error(`unhandled eventtype: ${exhaustiveCheck}`);
		}
	}

	removeAllListeners(): void {
		this.enclaveConn.removeAllListeners();
		this.erdstallConn?.removeAllListeners();
		this.erdstallEventHandlerCache.clear();
		this.erdstallOneShotHandlerCache.clear();
	}

	async subscribe(who?: Address): Promise<void> {
		return this.enclaveConn.subscribe(who);
	}

	async getAccount(who: Address): Promise<Account> {
		return (await this.enclaveConn.getAccount(who)).account;
	}

	initialize(timeout?: number): Promise<void> {
		return new Promise((resolve, reject) => {
			const rejectTimeout = setTimeout(
				reject,
				timeout ? timeout! : 15000,
			);

			this.enclaveConn.once("error", reject);
			this.enclaveConn.once("config", (config: ClientConfig) => {
				const erdstall = Erdstall__factory.connect(
					config.contract.toString(),
					this.provider,
				);
				this.erdstallConn = new LedgerWriteConn(
					erdstall,
					this.tokenProvider,
				);
				if (this instanceof Session) {
					this.receiptDispatcher.erdstallConn = this.erdstallConn;
				}

				for (const [ev, cbs] of this.erdstallEventHandlerCache) {
					cbs.forEach((cb) => {
						this.erdstallConn!.on(ev, cb);
					});
				}

				for (const [ev, cbs] of this.erdstallOneShotHandlerCache) {
					cbs.forEach((cb) => {
						this.erdstallConn!.once(ev, cb);
					});
				}
				this.erdstallOneShotHandlerCache.clear();

				clearTimeout(rejectTimeout);
				this.enclaveConn.off("error", reject);
				resolve();
			});
			this.enclaveConn.connect();
		});
	}
}
