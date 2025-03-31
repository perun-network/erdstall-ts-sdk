// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer as EthersSigner, Provider } from "ethers";
import * as common from "./contracts/common";
import {
	Asset,
	ChainAssets,
	LocalAsset,
	Amount,
	Tokens
} from "#erdstall/ledger/assets";
import { UnsignedTx } from "#erdstall/ledger/backend";
import { AssetID } from "#erdstall/crypto";
import {
	EthereumAddress,
	EthereumSigner,
} from "#erdstall/crypto/ethereum";
import { ChainProofChunk } from "#erdstall/api/responses";
import { Erdstall } from "./contracts";
import { LedgerReadConn } from "./readconn";
import { EthereumTokenProvider } from "./tokencache";
import { Chain, getChainName } from "#erdstall/ledger";
import { LedgerEventEmitters, LedgerEventMask } from "#erdstall/event";
import { encodePackedAssets } from "./ethwrapper";

import {
	IERC721__factory,
	IERC20__factory,
	Erdstall__factory
} from "./contracts";

import { toHex } from "#erdstall/utils/hexbytes";

import {
	UnsignedTxBatch,
	ApproveTx,
	DepositTx,
	WithdrawTx
} from "#erdstall/ledger/backend";
import { UnsignedEthTransaction } from "./transaction";


type TxOpts = {
	chainId: bigint,
	gasLimit: bigint,
	gasPrice: bigint;
	maxFeePerGas: bigint,
	maxPriorityFeePerGas: bigint
};

export class LedgerConn
{
	#chain: Chain;
	#provider: Provider;
	#erdstall: Erdstall;
	#signer?: EthereumSigner = undefined;
	#reader: LedgerReadConn;
	#ethTxOpts: Promise<TxOpts>;

	get chain() { return this.#chain; }

	private constructor(
		contract: EthereumAddress,
		signer: EthereumSigner | undefined,
		provider: Provider,
		chain: Chain,
		emitters: LedgerEventEmitters,
		tokenCache?: EthereumTokenProvider
	) {
		this.#provider = provider;

		let contract_provider: Provider | EthersSigner;
		if(signer instanceof EthereumSigner)
		{
			this.#signer = signer;
			contract_provider = this.#signer.voidSigner(provider);
		} else {
			contract_provider = provider;
		}

		this.#erdstall = Erdstall__factory.connect(
			contract.toString(), provider);

		this.#reader = new LedgerReadConn(
			this.#erdstall,
			tokenCache ?? new EthereumTokenProvider(chain),
			emitters);

		this.#chain = chain;

		this.#ethTxOpts = (async(): Promise<TxOpts> => {
			let feeP = provider.getFeeData();
			let chainIdP = provider.getNetwork().then(x => x.chainId);
			let fee = await feeP;
			let chainId = await chainIdP;

			// TODO: refresh the gas price regularly (every few minutes?)
			let opts: TxOpts = {
				chainId,
				gasPrice: fee.gasPrice ?? 1n,
				gasLimit: 1000_000n,
				maxFeePerGas: fee.maxFeePerGas ?? 100n,
				maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? 1n
			};
			console.log(`Transaction options on ${getChainName(this.chain)}: `, opts);
			return opts;
		})();
	}

	update_event_tracking(mask: LedgerEventMask)
	{ this.#reader.update_event_tracking(mask); }

	static dynamic(
		contract: EthereumAddress,
		signer: EthereumSigner | undefined,
		provider: Provider,
		chain: Chain,
		emitters: LedgerEventEmitters,
		tokenCache?: EthereumTokenProvider
	): LedgerConn {
		return new LedgerConn(
			contract,
			signer,
			provider,
			chain,
			emitters,
			tokenCache);
	}

	// enforces a read-only connection.
	static readonly(
		contract: EthereumAddress,
		provider: Provider,
		chain: Chain,
		emitters: LedgerEventEmitters,
		tokenCache?: EthereumTokenProvider
	): LedgerConn {
		return new LedgerConn(
			contract,
			undefined,
			provider,
			chain,
			emitters,
			tokenCache);
	}

	// enforces a writeable connection.
	static writing(
		contract: EthereumAddress,
		signer: EthereumSigner,
		provider: Provider,
		chain: Chain,
		emitters: LedgerEventEmitters,
		tokenCache?: EthereumTokenProvider
	): LedgerConn {
		return new LedgerConn(
			contract,
			signer,
			provider,
			chain,
			emitters,
			tokenCache);
	}

	get #writes(): void
	{
		if(!this.#signer)
			throw new Error("The ledger connection is read-only");
		return;
	}

	async withdraw(
		epoch: bigint,
		exitProofs: ChainProofChunk[],
	): Promise<UnsignedTxBatch> {
		this.#writes;

		const acc = await this.#signer!.address();
		const accStr = acc.toString();
		const calls: UnsignedTx[] = [];
		for(let i = 0; i < exitProofs.length; i++)
		{
			const chunk = exitProofs[i];
			let tx = await this.#erdstall.withdraw.populateTransaction({
				epoch: epoch,
				id: i,
				count: exitProofs.length,
				chain: this.chain,
				account: accStr,
				exit: true,
				tokens: encodePackedAssets(chunk.funds),
			}, chunk.sig.toString(),
			await this.#ethTxOpts);
			calls.push(
				new UnsignedEthTransaction(
					new WithdrawTx({
						chain: this.#chain,
						proofChunk: chunk,
						chunkIndex: i,
						chunkCount: exitProofs.length,
						epoch: epoch,
						account: acc}),
					tx));
		}

		return new UnsignedTxBatch(calls);
	}

	async deposit(
		assets: ChainAssets,
	): Promise<UnsignedTxBatch> {
		this.#writes;

		const calls: UnsignedEthTransaction[] = [];

		if (!assets.assets.size)
			throw new Error("attempting to deposit nothing");

		// NOTE IMPROVE: It might be nice if we would ignore other assets for other chains
		// and instead only require that the correct backend has entries here.
		// Observe user experience.

		const addStage = async (chain: Chain, tokenAddr: LocalAsset, amount: Asset) => {
			
			const assetID = AssetID.fromMetadata(
				chain,
				amount.assetType(),
				tokenAddr.id);

			let tokenAddrAddr: EthereumAddress;
			if(chain == this.chain)
			{
				tokenAddrAddr = EthereumAddress.fromLocalAsset(tokenAddr);
			}
			else
			{
				tokenAddrAddr = await this.#reader.getWrappedToken(assetID) ?? (() => {
					throw new Error(`Wrapped token for ${assetID} not yet deployed on ${getChainName(this.chain)}`);
				})();
			}

			if(amount instanceof Amount)
			{
				if(tokenAddrAddr.isZero() && (chain === this.chain))
				{
					calls.push(...await this.#makeETHDepositCalls(amount));
				} else
				{
					calls.push(...await this.#makeERC20DepositCalls(
						tokenAddrAddr,
						assetID,
						amount));
				}
			} else if(amount instanceof Tokens)
			{
				calls.push(...await this.#makeERC721DepositCalls(
					tokenAddrAddr,
					assetID,
					amount));
			} else throw new Error("Unhandled case");
		};

		for (const [chain, asset] of assets.assets) {
			for (const [tokenAddr, amount] of asset.fungibles.assets) {
				await addStage(chain, LocalAsset.fromKey(tokenAddr), amount);
			}
			for (const [tokenAddr, nfts] of asset.nfts.assets) {
				await addStage(chain, LocalAsset.fromKey(tokenAddr), nfts);
			}
		}

		return new UnsignedTxBatch(calls);
	}

	async #makeETHDepositCalls(
		amount: Amount,
	): Promise<UnsignedEthTransaction[]> {
		const holder = await this.#reader.tokenCache.getEthHolder(
			this.#signer!.voidSigner(this.#provider));

		const ETH = new Uint8Array(32);

		const assets = new ChainAssets;
		assets.addAsset(this.chain, ETH, amount);

		return [new UnsignedEthTransaction(
			new DepositTx(this.chain, assets),
			await holder.deposit.populateTransaction({
				...await this.#ethTxOpts,
				value: (amount as Amount).value,
			}))];
	}

	async #makeERC20DepositCalls(
		tokenAddr: EthereumAddress,
		tokenId: AssetID,
		amount: Asset,
	): Promise<UnsignedEthTransaction[]> {
		if (!(amount instanceof Amount)) {
			throw new Error("given value is not of type Amount");
		}

		const contract_provider = this.#signer!.voidSigner(this.#provider);
		const token = IERC20__factory.connect(
			tokenAddr.toString(),
			contract_provider);
		const holder = await this.#reader.tokenCache.getERC20Holder(
			contract_provider);

		const assets = new ChainAssets;
		assets.addAsset(tokenId.origin(), tokenId.localID(), amount);

		const holderAddr = await this.#reader.tokenCache.getERC20HolderAddress();

		return [
			new UnsignedEthTransaction(
				new ApproveTx(this.chain, holderAddr,  assets),
				await token.approve.populateTransaction(
					holderAddr.toString(),
					amount.value,
					await this.#ethTxOpts)),
			new UnsignedEthTransaction(
				new DepositTx(this.chain, assets),
				await holder.deposit.populateTransaction(
					tokenAddr.toString(),
					amount.value,
					await this.#ethTxOpts))
		];
	}

	async #makeERC721DepositCalls(
		tokenAddr: EthereumAddress,
		tokenId: AssetID, // might be a wrapped token.
		amount: Tokens,
	): Promise<UnsignedEthTransaction[]> {
		const contract_provider = this.#signer!.voidSigner(this.#provider);
		const token = IERC721__factory.connect(
			tokenAddr.toString(),
			contract_provider);
		const holder = await this.#reader.tokenCache.getERC721Holder(
			contract_provider);
		const holderAddr = await this.#reader.tokenCache.getERC721HolderAddress();

		const calls: UnsignedEthTransaction[] = [];

		for(const id of amount.value) {
			const assets = new ChainAssets;
			assets.addAsset(tokenId.origin(), tokenId.localID(), new Tokens([id]));

			calls.push(
				new UnsignedEthTransaction(
					new ApproveTx(this.chain, holderAddr, assets),
					await token.approve.populateTransaction(
						holderAddr.toString(),
						id,
						await this.#ethTxOpts)));
		}

		const assets = new ChainAssets;
		assets.addAsset(tokenId.origin(), tokenId.localID(), amount);

		calls.push(
			new UnsignedEthTransaction(
				new DepositTx(this.chain, assets),
				await holder.deposit.populateTransaction(
					tokenAddr.toString(),
					(amount as Tokens).value,
					await this.#ethTxOpts)));

		return calls;
	}
}
