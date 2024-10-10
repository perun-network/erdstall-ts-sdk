// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer as EthersSigner } from "ethers";
import * as common from "./contracts/common";
import { Asset, ChainAssets, LocalAsset, Amount } from "#erdstall/ledger/assets";
import { AssetID } from "#erdstall/crypto";
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
import { Chain, getChainName } from "#erdstall/ledger/chain";
import { encodePackedAssets } from "./ethwrapper";

import { toHex } from "#erdstall/utils/hexbytes";

type TransactionName = "approve" | "deposit" | "withdraw";

export class LedgerWriteConn
	extends LedgerReadConn
	implements LedgerWriter<"ethereum">
{
	readonly signer: Signer;
	readonly chain: Chain;

	constructor(
		contract: Erdstall,
		chain: Chain,
		tokenCache?: EthereumTokenProvider,
	) {
		super(contract, tokenCache ?? new EthereumTokenProvider(chain));

		if(!(contract.runner as any)?.signMessage)
			throw new Error("LedgerWriteConn: expected a signer provider");
		this.signer = new Signer(contract.runner! as EthersSigner);
		this.chain = chain;
	}

	async withdraw(
		epoch: bigint,
		exitProofs: ChainProofChunk[],
	): Promise<TransactionGenerator<"ethereum">> {
		const acc = (await this.signer.address()).toJSON();
		const calls = exitProofs.map(
			(chunk, i) => (obj?: common.NonPayableOverrides) =>
				this.contract.withdraw({
					epoch: epoch,
					id: i,
					count: exitProofs.length,
					chain: this.chain,
					account: acc,
					exit: true,
					tokens: encodePackedAssets(chunk.funds),
				}, chunk.sig.toJSON(),
				obj ?? {}));

		return {
			stages: this.call(calls.map(call => ["withdraw", call])),
			numStages: calls.length,
		};
	}

	async deposit(
		assets: ChainAssets,
	): Promise<TransactionGenerator<"ethereum">> {
		const calls: Calls = [];

		if (!assets.assets.size)
			throw new Error("attempting to deposit nothing");

		// NOTE IMPROVE: It might be nice if we would ignore other assets for other chains
		// and instead only require that the correct backend has entries here.
		// Observe user experience.
		//
		// NOTE: We do not only support `Chain.EthereumMainnet`.

		// TODO: handle wrapped assets?.
		const addStage = async (chain: Chain, tokenAddr: LocalAsset, amount: Asset) => {
			
			let tokenAddrAddr: Address;
			if(chain == this.chain)
			{
				// Native tokens are the last 20 bytes of the LocalAsset
				tokenAddrAddr = new Address(tokenAddr.id.slice(-20));
				if(!tokenAddr.id.slice(0,12).every(x => x == 0))
					throw new Error(`Invalid localID: ${toHex(tokenAddr.id)}`);
			}
			else
			{
				const assetID = AssetID.fromMetadata(
					chain,
					amount.assetType(),
					tokenAddr.id);
				tokenAddrAddr = await this.getWrappedToken(assetID) ?? (() => {
					throw new Error(`Wrapped token for ${assetID} not yet deployed on ${getChainName(this.chain)}`);
				})();
			}

			const ttype = (amount instanceof Amount)
				? tokenAddrAddr.isZero() && (chain === this.chain)
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

		for (const [chain, asset] of assets.assets) {
			for (const [tokenAddr, amount] of asset.fungibles.assets) {
				await addStage(chain, LocalAsset.fromKey(tokenAddr), amount);
			}
			for (const [tokenAddr, nfts] of asset.nfts.assets) {
				await addStage(chain, LocalAsset.fromKey(tokenAddr), nfts);
			}
		}

		return { stages: this.call(calls), numStages: calls.length };
	}

	private async *call(
		calls: Calls,
	): AsyncGenerator<
		[TransactionName, ethers.ContractTransactionResponse],
		void,
		void
	> {
		if (calls.length == 0) throw new Error("0 calls");

		let nonce = await this.signer.ethersSigner.getNonce();
		for (const [name, call] of calls) {
			yield (async (): Promise<
				[TransactionName, ethers.ContractTransactionResponse]
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
