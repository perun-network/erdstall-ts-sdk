// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer, providers } from "ethers";
import { Address, addressKey } from "#erdstall/crypto";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { TokenType } from "./tokentype";
import {
	Erdstall,
	ERC20__factory, ERC20Holder, ERC20Holder__factory,
	ERC721__factory, ERC721Holder, ERC721Holder__factory,
	ETHHolder, ETHHolder__factory,
} from "#erdstall/ledger/backend/ethereum/contracts";


// Gets created with unresolved holders. Call resolve_holders() to pass the actual holders. Access token holders via tokenHolderFor().
export class EthereumTokenProvider {
	readonly holders: Promise<Map<TokenType, EthereumAddress>>;
	private set_holders?: (arg: Map<TokenType, EthereumAddress>) => void;
	private fail_holders?: (arg: any) => void;

	constructor() {
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

	// query token holder for a token type. Fails if none is configured within a reasonable timeout.
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

	async getERC20Holder(provider: providers.Provider): Promise<ERC20Holder> {
		const holder = await this.tokenHolderFor("ERC20");
		return ERC20Holder__factory.connect(holder.toString(), provider);
	}

	async getERC721Holder(provider: providers.Provider): Promise<ERC721Holder> {
		const holder = await this.tokenHolderFor("ERC721");
		return ERC721Holder__factory.connect(holder.toString(), provider);
	}

	async getEthHolder(provider: providers.Provider): Promise<ETHHolder> {
		const holder = await this.tokenHolderFor("ETH");
		return ETHHolder__factory.connect(holder.toString(), provider);
	}
}
