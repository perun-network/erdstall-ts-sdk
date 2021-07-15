// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";
import { ErdstallWatcher, Depositor, Withdrawer } from "../../erdstall";
import { Erdstall } from "./contracts/Erdstall";
import { Assets } from "../";
import { Address } from "../";
import { Stages } from "../../utils";
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
export interface LedgerConnection
	extends ErdstallWatcher,
		Depositor,
		Withdrawer {
	erdstall(): Address;
}

export class LedgerAdapter implements LedgerConnection {
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
	): Promise<Stages<ethers.ContractTransaction>> {
		return this.call([
			[
				"withdraw",
				(
					_?: ethers.PayableOverrides,
				): Promise<ethers.ContractTransaction> => {
					const [balance, sig] = exitProof.toEthProof();
					return this.contract.withdraw(balance, sig);
				},
			],
		]);
	}

	async deposit(
		assets: Assets,
	): Promise<Stages<Promise<ethers.ContractTransaction>>> {
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
	): Promise<Stages<Promise<ethers.ContractTransaction>>> {
		let nonce = await this.signer.getTransactionCount();
		let stages = new Stages<Promise<ethers.ContractTransaction>>();
		let promises = new Array<[Function, Function]>();
		let promisesValues = new Array<
			[(ctx: ethers.ContractTransaction) => void, (obj: any) => void]
		>();

		for (const [name, ___] of calls) {
			const promise = new Promise<ethers.ContractTransaction>(
				(resolve, reject) => {
					promisesValues.push([resolve, reject]);
				},
			);
			promises.push(stages.add(name, promise));
		}

		// Due to limitations with MetaMask, we have to sequentialize the deposit
		// calls and put them in stages to keep allowing UX/UI updates for each
		// step.
		(async () => {
			for (const i in calls) {
				const [_, call] = calls[i];
				const [resolve, __] = promises[i];
				const [resolveValue, rejectValue] = promisesValues[i];
				try {
					const pctx = call({ nonce: nonce++ });
					pctx.then(resolveValue, rejectValue);

					const ctx = await pctx;
					await ctx.wait();
					resolve(ctx);
				} catch (e) {
					for (const [_, reject] of promises.slice(Number(i)))
						reject(e);
				}
			}
		})();

		return stages;
	}
}

export default LedgerAdapter;
