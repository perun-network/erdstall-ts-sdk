// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";
import { Depositor, Withdrawer } from "#erdstall";
import { Assets } from "#erdstall/ledger/assets";
import { Address, ErdstallEvent } from "#erdstall/ledger";
import { Stages } from "#erdstall/utils";
import { BalanceProof } from "#erdstall/api/responses";
import { Erdstall } from "./contracts/Erdstall";
import { LedgerReader, LedgerReadConn } from "./readconn";
import { depositors, DepositCalls } from "./tokenmanager";
import { TokenTypesCache } from "./tokencache";

// LedgerConnection describes the connection a client can have to the on-chain
// part of Erdstall.
export interface LedgerWriter extends LedgerReader, Depositor, Withdrawer {
	erdstall(): Address;
}

export class LedgerWriteConn extends LedgerReadConn implements LedgerWriter {
	readonly signer: Signer;
	readonly tokenCache: TokenTypesCache;

	constructor(contract: Erdstall) {
		super(contract);
		this.tokenCache = new TokenTypesCache();
		this.signer = contract.signer;
	}

	async withdraw(
		exitProof: BalanceProof,
	): Promise<Stages<Promise<ethers.ContractTransaction>>> {
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

		if(!assets.values.size)
			throw new Error("attempting to deposit nothing");

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

		if(calls.length == 0)
			throw new Error("0 calls");

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
						reject(("message" in e) ? new Error(e.message) : new Error(e));
				}
			}
		})();

		return stages;
	}
}