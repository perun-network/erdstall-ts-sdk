// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallClient } from "erdstall";
import { Erdstall__factory } from "#erdstall/ledger/backend/contracts";
import { ClientConfig } from "#erdstall/api/responses";
import { Enclave, EnclaveReader, EnclaveEvent } from "#erdstall/enclave";
import {
	LedgerWriteConn,
	LedgerReader,
	LedgerWriter,
	Address,
	Account,
	ErdstallEvent,
	isLedgerEvent,
} from "#erdstall/ledger";
import { TokenTypesCache, TokenCache } from "#erdstall/ledger/backend";
import { EventCache, OneShotEventCache } from "#erdstall/utils";
import { ethers, Signer } from "ethers";
import { NFTMetadata } from "#erdstall/ledger/backend";

export class Client implements ErdstallClient {
	readonly tokenCache: TokenCache;
	protected enclaveConn: EnclaveReader;
	protected provider: ethers.providers.Provider | Signer;
	protected erdstallConn?: LedgerReader | LedgerWriter;
	private erdstallEventHandlerCache: EventCache<ErdstallEvent>;
	private erdstallOneShotHandlerCache: OneShotEventCache<ErdstallEvent>;

	constructor(
		provider: ethers.providers.Provider | Signer,
		encConn: EnclaveReader | URL,
	) {
		this.provider = provider;
		if (encConn! instanceof URL)
			this.enclaveConn = Enclave.dial(encConn as URL);
		else this.enclaveConn = encConn as EnclaveReader;
		this.erdstallEventHandlerCache = new EventCache<ErdstallEvent>();
		this.erdstallOneShotHandlerCache =
			new OneShotEventCache<ErdstallEvent>();
		this.tokenCache = new TokenTypesCache();
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

	on(ev: ErdstallEvent | EnclaveEvent, cb: Function): void {
		if (isLedgerEvent(ev)) {
			if (this.erdstallConn) {
				this.erdstallConn.on(ev, cb);
			} else {
				this.erdstallEventHandlerCache.set(ev, cb);
			}
		} else {
			return this.enclaveConn.on(ev, cb);
		}
	}

	once(ev: ErdstallEvent | EnclaveEvent, cb: Function): void {
		if (isLedgerEvent(ev)) {
			if (this.erdstallConn) {
				this.erdstallConn.once(ev, cb);
			} else {
				this.erdstallOneShotHandlerCache.set(ev, cb);
			}
		} else {
			return this.enclaveConn.once(ev, cb);
		}
	}

	off(ev: ErdstallEvent | EnclaveEvent, cb: Function): void {
		if (isLedgerEvent(ev)) {
			if (!this.erdstallConn) {
				return;
			}
			this.erdstallConn.off(ev, cb);
		} else {
			return this.enclaveConn.off(ev, cb);
		}
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
					this.tokenCache,
				);

				for (const [ev, cbs] of this.erdstallEventHandlerCache) {
					cbs.forEach((cb) => {
						this.erdstallConn!.on(ev, cb);
					});
				}

				for (const [ev, cbs] of this.erdstallOneShotHandlerCache) {
					cbs.forEach((cb) => {
						this.erdstallConn!.on(ev, cb);
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
