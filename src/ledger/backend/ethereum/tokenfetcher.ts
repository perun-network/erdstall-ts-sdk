// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer } from "ethers";
import { Address, addressKey } from "#erdstall/crypto";
import { ETHZERO, TokenType } from "#erdstall/ledger/assets";
import { TokenProvider } from "#erdstall/ledger/backend";
import { TokenTypeRegistered } from "#erdstall/ledger/event";
import { ERC20__factory, ERC721__factory } from "./contracts";
import { Erdstall } from "./contracts/contracts/Erdstall";

type TokenTypes = Map<string, TokenType>;
type TokenHolders = Map<TokenType, string>;

interface Responder {
	symbol(): Promise<string>;
}

export class TokenFetcher implements TokenProvider<"ethereum"> {
	readonly typeCache: TokenTypes;
	readonly holderCache: TokenHolders;
	private bigbang?: number;

	constructor() {
		this.typeCache = new Map<string, TokenType>();
		this.typeCache.set(ETHZERO, "ETH");
		this.holderCache = new Map<TokenType, string>();
	}

	setType(tokenAddr: string, ttype: TokenType) {
		this.typeCache.set(addressKey(tokenAddr), ttype);
	}

	async tokenHolderFor(
		erdstall: Erdstall,
		ttype: TokenType,
	): Promise<string> {
		if (this.holderCache.has(ttype)) {
			return this.holderCache.get(ttype)!;
		}

		await this.queryRegisteredTokenTypes(erdstall, this.bigbang);

		if (!this.holderCache.has(ttype)) {
			throw new Error(
				"no holder for the given tokentype registered on erdstall",
			);
		}
		return this.holderCache.get(ttype)!;
	}

	async tokenTypeOf(
		erdstall: Erdstall,
		tokenAddr: string,
	): Promise<TokenType> {
		tokenAddr = addressKey(tokenAddr);
		if (this.typeCache.has(tokenAddr)) {
			return this.typeCache.get(tokenAddr)!;
		}

		const ttype = await this.queryTokenType(erdstall, tokenAddr);
		if (!ttype) {
			return Promise.reject(
				new Error(`given token not registered: ${tokenAddr}`),
			);
		}

		this.typeCache.set(tokenAddr, ttype!);
		return ttype!;
	}

	async queryTokenType(
		erdstall: Erdstall,
		tokenAddr: string,
	): Promise<TokenType | undefined> {
		tokenAddr = addressKey(tokenAddr);
		// TODO: Fix me.
		// await this.queryRegisteredTokens(erdstall, this.bigbang);
		return this.typeCache.get(tokenAddr);
	}

	async findRegisteredTokenWithSymbol(
		erdstall: Erdstall,
		symbol: string,
		fromBlock?: number,
	): Promise<Address<"ethereum"> | undefined> {
		const from = fromBlock
			? fromBlock
			: (await erdstall.bigBangTime()).toNumber();

		// TODO: Fix me.
		throw new Error("not implemented");
		// const registeredTokens = await this.queryRegisteredTokens(
		// 	erdstall,
		// 	from,
		// );

		// for (const ev of registeredTokens) {
		// 	try {
		// 		const token = this.resolveTokenType(
		// 			erdstall.signer,
		// 			requireTokenType(ev.tokenType),
		// 			ev.token,
		// 		);
		// 		const sym = await token.symbol();
		// 		if (sym === symbol) {
		// 			return ev.token;
		// 		}
		// 	} catch {
		// 		return;
		// 	}
		// }
		return;
	}

	async queryRegisteredTokenTypes(
		erdstall: Erdstall,
		fromBlock?: number,
	): Promise<TokenTypeRegistered<"ethereum">[]> {
		const from = fromBlock
			? fromBlock
			: (await erdstall.bigBangTime()).toNumber();

		const filter = erdstall.filters.TokenTypeRegistered(null, null);
		return erdstall.queryFilter(filter, from).then((ev) => {
			return ev.map((entry) => {
				// TODO: Fix me.
				throw new Error("not implemented");
				// const ttype = requireTokenType(entry.args.tokenType);
				// const tokenHolder = entry.args.tokenHolder;

				// if (!this.holderCache.has(ttype)) {
				// 	this.holderCache.set(ttype, tokenHolder);
				// }

				// return {
				// 	source: "ethereum",
				// 	tokenType: ttype,
				// 	tokenHolder: EthereumAddress.fromString(tokenHolder),
				// };
			});
		});
	}

	resolveTokenType(
		signer: Signer,
		ttype: TokenType,
		token: string | Address<"ethereum">,
	): Responder {
		token = addressKey(token);
		switch (ttype) {
			case "ERC20":
				return ERC20__factory.connect(token, signer);
			case "ERC721":
				return ERC721__factory.connect(token, signer);
			case "ETH":
				return {
					symbol: async function (): Promise<string> {
						return "ETH";
					},
				};
			default:
				throw Error("not implemented");
		}
	}
}
