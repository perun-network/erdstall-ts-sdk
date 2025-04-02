// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";
import { Address, AssetID, AssetType } from "#erdstall/crypto";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { TokenType } from "./tokentype";
import { Chain, getChainName } from "#erdstall/ledger";
import { LocalAsset } from "#erdstall/ledger/assets";
import {
	Erdstall,
	ERC20__factory, ERC20Holder, ERC20Holder__factory,
	ERC721__factory, ERC721Holder, ERC721Holder__factory,
	ETHHolder, ETHHolder__factory,
} from "#erdstall/ledger/backend/ethereum/contracts";


// Gets created with unresolved holders. Call resolve_holders() to pass the actual holders. Access token holders via tokenHolderFor().
export class EthereumTokenProvider {
	readonly holders: Promise<Map<TokenType, EthereumAddress>>;
	readonly chain: Chain;
	// NOTE: undeployed tokens always miss the cache and cause a request.
	private cache = new Map<string, EthereumAddress>();
	private set_holders?: (arg: Map<TokenType, EthereumAddress>) => void;
	private fail_holders?: (arg: any) => void;

	constructor(chain: Chain) {
		this.chain = chain;
		this.holders = new Promise<Map<TokenType, EthereumAddress>>(
			(acc, rej) => {
			this.set_holders = acc;
			this.fail_holders = rej;
			}
		);
	}

	resolve_holders(holders: Map<TokenType, EthereumAddress>) {
		const set_holders = this.set_holders;
		this.fail_holders = undefined;
		this.set_holders = undefined;
		set_holders!(holders);

		console.info(Array.from(holders.entries()).map(([name, addr]) => `${getChainName(this.chain)} ${name} holder: ${addr.toString()}`).join("\n"));
	}

	async fetch_holders(
		contract: Erdstall,
	): Promise<void> {
		if(!this.set_holders)
		{
			await this.holders;
			return;
		}

		try {
			const holders = new Map<TokenType, EthereumAddress>();
			const ERC20 = contract.tokenHolders(0);
			const ERC721 = contract.tokenHolders(1);
			const ETH = contract.tokenHolders(2);

			holders.set("ERC20", EthereumAddress.fromString(await ERC20));
			holders.set("ERC721", EthereumAddress.fromString(await ERC721));
			holders.set("ETH", EthereumAddress.fromString(await ETH));
			this.resolve_holders(holders);
		} catch(e) { this.set_holders = undefined; this.fail_holders!(e); }
	}

	// query token holder for a token type. Fails if none is configured within a reasonable timeout. Remember to call fetch_holders()!
	async tokenHolderFor(
		ttype: TokenType,
	): Promise<EthereumAddress> {
		return await new Promise<EthereumAddress>(async (accept, reject) => {
			const timeout = setTimeout(() => {
				const fail_holders = this.fail_holders;
				this.fail_holders = undefined;
				const e = new Error("Timeout: no token holders have been provided!");
				fail_holders!(e);
				reject(e);
			}, 15000);

			try {
				accept((await this.holders).get(ttype)!);
			} catch(e: any) {
				reject(e);
			} finally {
				clearTimeout(timeout);
			}
		});
	}

	async getERC20Holder(provider: ethers.Provider | ethers.Signer): Promise<ERC20Holder> {
		const holder = await this.getERC20HolderAddress();
		return ERC20Holder__factory.connect(holder.toString(), provider);
	}

	async getERC20HolderAddress(): Promise<EthereumAddress> {
		return await this.tokenHolderFor("ERC20");
	}

	async getERC721Holder(provider: ethers.Provider | ethers.Signer): Promise<ERC721Holder> {
		const holder = await this.getERC721HolderAddress();
		return ERC721Holder__factory.connect(holder.toString(), provider);
	}

	async getERC721HolderAddress(): Promise<EthereumAddress> {
		return await this.tokenHolderFor("ERC721");
	}

	async getEthHolder(provider: ethers.Provider | ethers.Signer): Promise<ETHHolder> {
		const holder = await this.getEthHolderAddress();
		return ETHHolder__factory.connect(holder.toString(), provider);
	}

	async getEthHolderAddress(): Promise<EthereumAddress> {
		return await this.tokenHolderFor("ETH");
	}

	async getWrappedFungible(provider: ethers.Provider, origin: Chain, local: LocalAsset): Promise<EthereumAddress | undefined> {
		if(origin === this.chain) {
			throw new Error("not a wrapped token…");
		}
		const asset = AssetID.fromMetadata(origin, AssetType.Fungible, local.id);
		const key = asset.toString();
		let addr: EthereumAddress | undefined;
		if(addr = this.cache.get(key))
			return addr!.clone() as EthereumAddress;

		const holder = await this.getERC20Holder(provider);
		addr = EthereumAddress.fromString(
			await holder.deployedToken(origin, local.id));
		if(addr.isZero())
			return undefined;
		this.cache.set(key, addr.clone() as EthereumAddress)
		return addr!;
	}

	async getWrappedNFT(provider: ethers.Provider, origin: Chain, local: LocalAsset): Promise<EthereumAddress | undefined> {
		if(origin === this.chain) {
			throw new Error("not a wrapped token…");
		}
		const asset = AssetID.fromMetadata(origin, AssetType.NFT, local.id);
		const key = asset.toString()
		let addr: EthereumAddress | undefined;
		if(addr = this.cache.get(key))
			return addr!.clone() as EthereumAddress;

		const holder = await this.getERC721Holder(provider);
		addr = EthereumAddress.fromString(
			await holder.deployedToken(origin, local.id));
		if(addr.isZero())
			return undefined;
		this.cache.set(key, addr.clone() as EthereumAddress)
		return addr;
	}
}
