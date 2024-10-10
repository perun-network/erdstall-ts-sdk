// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";
import { Address, addressKey } from "#erdstall/crypto";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { TokenType } from "./tokentype";
import { Chain } from "#erdstall/ledger";
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
			holders.set("ERC20", EthereumAddress.fromString(
				await contract.tokenHolders(0)));
			holders.set("ERC721", EthereumAddress.fromString(
				await contract.tokenHolders(1)));
			holders.set("ETH", EthereumAddress.fromString(
				await contract.tokenHolders(2)));
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

	async getERC20Holder(provider: ethers.Provider): Promise<ERC20Holder> {
		const holder = await this.tokenHolderFor("ERC20");
		return ERC20Holder__factory.connect(holder.toString(), provider);
	}

	async getERC721Holder(provider: ethers.Provider): Promise<ERC721Holder> {
		const holder = await this.tokenHolderFor("ERC721");
		return ERC721Holder__factory.connect(holder.toString(), provider);
	}

	async getEthHolder(provider: ethers.Provider): Promise<ETHHolder> {
		const holder = await this.tokenHolderFor("ETH");
		return ETHHolder__factory.connect(holder.toString(), provider);
	}
}
