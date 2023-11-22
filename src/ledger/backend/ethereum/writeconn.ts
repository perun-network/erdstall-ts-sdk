// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";
import { Asset, ChainAssets, Amount } from "#erdstall/ledger/assets";
import {
	EthereumAddress as Address,
	EthereumSigner as Signer,
} from "#erdstall/crypto/ethereum";
import { ChainProofChunk } from "#erdstall/api/responses";
import { Erdstall } from "./contracts";
import { LedgerWriter } from "#erdstall/ledger/backend";
import { LedgerReadConn } from "./readconn";
import { depositors, Calls } from "./tokenmanager";
import { EthereumTokenProvider } from "./tokencache";
import { TransactionGenerator } from "#erdstall/utils";
import { Chain } from "#erdstall/ledger/chain";

type TransactionName = "approve" | "deposit" | "withdraw";

export class LedgerWriteConn
	extends LedgerReadConn
	implements LedgerWriter<"ethereum">
{
	readonly signer: Signer;
	readonly chain: number;

	constructor(
		contract: Erdstall,
		chain: number,
		tokenCache: EthereumTokenProvider,
	) {
		super(contract, tokenCache);
		this.signer = new Signer(contract.signer);
		this.chain = chain;
	}

	async withdraw(
		epoch: bigint,
		exitProofs: ChainProofChunk[],
	): Promise<TransactionGenerator<"ethereum">> {
		const calls: Promise<ethers.ContractTransaction>[] = [];

		for(let i = 0; i < exitProofs.length; i++)
		{
			const chunk = exitProofs[i];
			calls.push(this.contract.withdraw({
				epoch: epoch,
				id: i,
				count: exitProofs.length,
				chain: this.chain,
				account: (await this.signer.address()).toJSON(),
				exit: true,
				tokens: (() => { throw new Error("TODO"); })(),
			}, chunk.sig.toJSON()));
		}

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

	async deposit(
		assets: ChainAssets,
	): Promise<TransactionGenerator<"ethereum">> {
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
			const tokenAddrAddr = Address.fromString(tokenAddr);
			const ttype = (amount instanceof Amount)
				? tokenAddrAddr.isZero()
					? "ETH"
					: "ERC20"
				: "ERC721";
			const holder = await this.tokenCache.tokenHolderFor(ttype);

			const depositCalls = depositors.get(ttype)!(
				this.signer,
				holder,
				tokenAddrAddr,
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

		let nonce = await this.signer.ethersSigner.getTransactionCount();
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
