// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";
import { ErdstallWatcher, Depositor, Withdrawer } from "../../erdstall";
import { Erdstall } from "./contracts/Erdstall";
import { Assets } from "../";
import { Address } from "../";
import { BalanceProof } from "../../api/responses";
import { depositors, DepositCalls } from "./tokenmanager";
import { TokenTypesCache } from "./tokencache";
import ErdstallEvent from "../event";

export const ErrUnsupportedLedgerEvent = new Error(
	"unsupported ledger event encountered",
);
export const ErrErdstallContractNotConnected = new Error(
	"erdstall contract not connected",
);

// LedgerConnection describes the connection a client can have to the on-chain
// part of Erdstall.
export interface LedgerWatcher extends ErdstallWatcher, Depositor, Withdrawer {
	erdstall(): Address;
}

export class LedgerAdapter implements LedgerWatcher {
	readonly signer: Signer;
	readonly contract: Erdstall;
	readonly tokenCache: TokenTypesCache;
	private eventCache: Map<Function, (args: Array<any>) => void>;

	constructor(contract: Erdstall) {
		this.signer = contract.signer;
		this.contract = contract;
		this.tokenCache = new TokenTypesCache();
		this.eventCache = new Map<Function, (args: Array<any>) => void>();
	}

	on(ev: ErdstallEvent, cb: Function): void {
		const wrappedCB = (args: Array<any>) => {
			cb(args);
		};
		this.eventCache.set(cb, wrappedCB);
		this.contract.on(ev, wrappedCB);
	}

	once(ev: ErdstallEvent, cb: Function): void {
		this.contract.once(ev, (args: Array<any>) => {
			cb(args);
		});
	}

	off(ev: ErdstallEvent, cb: Function): void {
		if (!this.eventCache.has(cb)) {
			return;
		}
		this.contract.off(ev, this.eventCache.get(cb)!);
		this.eventCache.delete(cb);
	}

	erdstall(): Address {
		return Address.fromString(this.contract.address);
	}

	async withdraw(
		exitProof: BalanceProof,
	): Promise<ethers.ContractTransaction[]> {
		return this.call([
			(
				_?: ethers.PayableOverrides,
			): Promise<ethers.ContractTransaction> => {
				const [balance, sig] = exitProof.toEthProof();
				return this.contract.withdraw(balance, sig);
			},
		]);
	}

	async deposit(assets: Assets): Promise<ethers.ContractTransaction[]> {
		const calls: DepositCalls = [];
		for (const [tokenAddr, asset] of assets.values) {
			const ttype = await this.tokenCache.tokenTypeOf(
				this.contract,
				tokenAddr,
			);
			const holder = await this.tokenCache.tokenHolderFor(
				this.contract,
				ttype,
			);
			const depositCalls = depositors.get(ttype)!(
				this.signer,
				Address.fromString(holder),
				Address.fromString(tokenAddr),
				asset,
			);
			calls.push(...depositCalls);
		}

		return this.call(calls);
	}

	private async call(
		calls: DepositCalls,
	): Promise<ethers.ContractTransaction[]> {
		let nonce = await this.signer.getTransactionCount();

		const pendingTXs: ethers.ContractTransaction[] = [];
		for (const call of calls) {
			pendingTXs.push(await call({ nonce: nonce++ }));
		}

		return pendingTXs;
	}
}

export default LedgerAdapter;
