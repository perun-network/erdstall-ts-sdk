// SPDX-License-Identifier: Apache-2.0
"use strict";

import { providers, Signer } from "ethers";
import { ethers } from "ethers";

import { Erdstall } from "./erdstall";
import { Erdstall__factory } from "./ledger/backend/contracts";
import { TxReceipt } from "./api/responses";
import { BalanceProof } from "./api/responses";
import { ClientConfig } from "./api/responses";
import { Transfer, Mint, ExitRequest } from "./api/transactions";
import { EnclaveConnection } from "./enclave";
import { LedgerWatcher, LedgerAdapter } from "./ledger";
import { Assets } from "./ledger";
import { Address } from "./ledger";
import { Uint256 } from "./api/util";
import { EventCache, OneShotEventCache } from "./utils";
import ErdstallEvent, { isLedgerEvent } from "./ledger/event";
import EnclaveEvent from "./enclave/event";

export const ErrUnitialisedClient = new Error("client unitialised");

export default class Client implements Erdstall {
	readonly address: Address;
	private nonce: bigint;
	private enclaveConn: EnclaveConnection;
	private erdstallConn?: LedgerWatcher;
	private erdstallEventHandlerCache: EventCache<ErdstallEvent>;
	private erdstallOneShotHandlerCache: OneShotEventCache<ErdstallEvent>;
	private signer: Signer;

	constructor(address: Address, signer: Signer, encConn: EnclaveConnection) {
		this.address = address;
		this.signer = signer;
		this.nonce = 0n;
		this.enclaveConn = encConn;
		this.erdstallEventHandlerCache = new EventCache<ErdstallEvent>();
		this.erdstallOneShotHandlerCache = new OneShotEventCache<ErdstallEvent>();
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

	async transferTo(assets: Assets, to: Address): Promise<TxReceipt> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}
		const tx = new Transfer(this.address, this.nonce, to, assets);
		tx.sign(this.erdstallConn.erdstall(), this.signer);
		return this.enclaveConn.transfer(tx);
	}

	async mint(
		sender: Address,
		token: Address,
		id: Uint256,
	): Promise<TxReceipt> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		const minttx = new Mint(sender, this.nonce, token, id);
		minttx.sign(this.erdstallConn.erdstall(), this.signer);
		return this.enclaveConn.mint(minttx);
	}

	async deposit(assets: Assets): Promise<ethers.ContractTransaction[]> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		return this.erdstallConn.deposit(assets);
	}

	async exit(): Promise<BalanceProof> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		const exittx = new ExitRequest(this.address, this.nonce);
		exittx.sign(this.erdstallConn.erdstall(), this.signer);
		return this.enclaveConn.exit(exittx);
	}

	async withdraw(
		exitProof: BalanceProof,
	): Promise<ethers.ContractTransaction[]> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		return this.erdstallConn.withdraw(exitProof);
	}

	async leave(): Promise<ethers.ContractTransaction[]> {
		const exitProof = await this.exit();
		return this.withdraw(exitProof);
	}

	initialise(): void {
		this.enclaveConn.on("config", (config: ClientConfig) => {
			const erdstall = Erdstall__factory.connect(
				config.contract.toString(),
				this.signer,
			);
			this.erdstallConn = new LedgerAdapter(erdstall);

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
		});
		this.enclaveConn.connect();
	}
}
