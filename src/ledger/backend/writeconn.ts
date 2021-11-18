// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";
import { Depositor, Withdrawer } from "#erdstall";
import { Assets } from "#erdstall/ledger/assets";
import { Address } from "#erdstall/ledger";
import { TransactionName } from "#erdstall/utils";
import { BalanceProof } from "#erdstall/api/responses";
import { Erdstall } from "./contracts/Erdstall";
import { LedgerReader, LedgerReadConn } from "./readconn";
import { depositors, Calls } from "./tokenmanager";
import { TokenProvider } from "./tokencache";
import { TransactionGenerator } from "#erdstall/utils";

// LedgerConnection describes the connection a client can have to the on-chain
// part of Erdstall.
export interface LedgerWriter extends LedgerReader, Depositor, Withdrawer {
	erdstall(): Address;
}

export class LedgerWriteConn extends LedgerReadConn implements LedgerWriter {
	readonly signer: Signer;

	constructor(contract: Erdstall, tokenCache: TokenProvider) {
		super(contract, tokenCache);
		this.signer = contract.signer;
	}

	async withdraw(exitProof: BalanceProof): Promise<TransactionGenerator> {
		return {
			stages: this.call([
				[
					"withdraw",
					(
						_?: ethers.PayableOverrides,
					): Promise<ethers.ContractTransaction> => {
						const [balance, sig] = exitProof.toEthProof();
						return this.contract.withdraw(balance, sig);
					},
				],
			]),
			numStages: 1,
		};
	}

	async deposit(assets: Assets): Promise<TransactionGenerator> {
		const calls: Calls = [];

		if (!assets.values.size)
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

		return { stages: this.call(calls), numStages: calls.length };
	}

	private async *call(
		calls: Calls,
	): AsyncGenerator<
		[TransactionName, ethers.ContractTransaction],
		void,
		void
	> {
		if (calls.length == 0) throw new Error("0 calls");

		let nonce = await this.signer.getTransactionCount();
		for (const [name, call] of calls) {
			yield (async (): Promise<
				[TransactionName, ethers.ContractTransaction]
			> => {
				try {
					const ctx = await call({ nonce: nonce++ });
					return [name, ctx];
				} catch (e) {
					throw "message" in e ? new Error(e.message) : new Error(e);
				}
			})();
		}
	}
}
