// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";
import { Asset, ChainAssets } from "#erdstall/ledger/assets";
import { EthereumAddress as Address } from "#erdstall/crypto/ethereum";
import { ChainProofChunk } from "#erdstall/api/responses";
import { Erdstall } from "./contracts";
import { LedgerWriter } from "#erdstall/ledger/backend";
import { LedgerReadConn } from "./readconn";
import { depositors, Calls } from "./tokenmanager";
import { TokenProvider } from "#erdstall/ledger/backend";
import { TransactionGenerator } from "#erdstall/utils";
import { Chain } from "#erdstall/ledger/chain";

type TransactionName = "approve" | "deposit" | "withdraw";

export class LedgerWriteConn
	extends LedgerReadConn
	implements LedgerWriter<"ethereum">
{
	readonly signer: Signer;

	constructor(contract: Erdstall, tokenCache: TokenProvider<"ethereum">) {
		super(contract, tokenCache);
		this.signer = contract.signer;
	}

	async withdraw<B extends "ethereum">(
		_backend: B,
		exitProofs: ChainProofChunk[],
	): Promise<TransactionGenerator<B>> {
		return {
			stages: this.call([
				[
					"withdraw",
					(
						_?: ethers.PayableOverrides,
					): Promise<ethers.ContractTransaction> => {
						// TODO: Reintroduce.
						throw new Error("Method not implemented.");
						// const [balance, sig] = exitProof.toEthProof();
						// return this.contract.withdraw(balance, sig);
					},
				],
			]),
			numStages: 1,
		};
	}

	async deposit<B extends "ethereum">(
		_backend: B,
		assets: ChainAssets,
	): Promise<TransactionGenerator<B>> {
		const calls: Calls = [];

		if (!assets.assets.size)
			throw new Error("attempting to deposit nothing");

		// TODO: It might be nice if we would ignore other assets for other chains
		// and instead only require that the correct backend has entries here.
		// Observe user experience.
		//
		// TODO: We do not only support `Chain.EthereumMainnet`.
		if (
			assets.assets.size !== 1 ||
			!assets.assets.has(Chain.EthereumMainnet)
		)
			throw new Error("attempting to deposit non-ethereum assets");

		const addStage = async (tokenAddr: string, amount: Asset) => {
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
				amount,
			);
			calls.push(...depositCalls);
		};

		for (const [_chain, asset] of assets.assets) {
			for (const [tokenAddr, amount] of asset.fungibles.assets) {
				await addStage(tokenAddr, amount);
			}
			for (const [tokenAddr, nfts] of asset.nfts.assets) {
				await addStage(tokenAddr, nfts);
			}
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
				} catch (e: any) {
					throw "message" in e ? new Error(e.message) : new Error(e);
				}
			})();
		}
	}
}
