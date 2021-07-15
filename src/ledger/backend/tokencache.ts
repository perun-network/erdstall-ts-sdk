// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer } from "ethers";
import { TokenType } from "../assets";
import { Erdstall } from "./contracts/Erdstall";
import { ERC20__factory, ERC721__factory } from "./contracts";

interface TokenRegisteredEvent {
	token: string;
	tokenType: string;
	tokenHolder: string;
}

interface TokenTypeRegisteredEvent {
	tokenType: string;
	tokenHolder: string;
}

interface Responder {
	symbol(): Promise<string>;
}

type TokenTypes = Map<string, TokenType>;
type TokenHolders = Map<TokenType, string>;

export class TokenTypesCache {
	readonly typeCache: TokenTypes;
	readonly holderCache: TokenHolders;
	private bigbang?: number;

	constructor() {
		this.typeCache = new Map<string, TokenType>();
		this.holderCache = new Map<TokenType, string>();
	}

	setType(tokenAddr: string, ttype: TokenType) {
		this.typeCache.set(tokenAddr, ttype);
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
		if (this.typeCache.has(tokenAddr)) {
			return this.typeCache.get(tokenAddr)!;
		}

		const ttype = await this.queryTokenType(erdstall, tokenAddr);
		if (!ttype) {
			Promise.reject(new Error("given token not registered."));
		}

		this.typeCache.set(tokenAddr, ttype!);
		return ttype!;
	}

	async queryTokenType(
		erdstall: Erdstall,
		tokenAddr: string,
	): Promise<TokenType | undefined> {
		await this.queryRegisteredTokens(erdstall, this.bigbang);
		return this.typeCache.get(tokenAddr);
	}

	async findRegisteredTokenWithSymbol(
		erdstall: Erdstall,
		symbol: string,
		fromBlock?: number,
	): Promise<string | undefined> {
		const from = fromBlock
			? fromBlock
			: (await erdstall.bigBang()).toNumber();

		const registeredTokens = await this.queryRegisteredTokens(
			erdstall,
			from,
		);

		for (const ev of registeredTokens) {
			try {
				const token = this.resolveTokenType(
					erdstall.signer,
					// FIXME: Figure out a way to assert this cast and make it more
					// elegant.
					ev.tokenType as TokenType,
					ev.token,
				);
				const sym = await token.symbol();
				if (sym === symbol) {
					return ev.token;
				}
			} catch {
				return;
			}
		}
		return;
	}

	async queryRegisteredTokenTypes(
		erdstall: Erdstall,
		fromBlock?: number,
	): Promise<TokenTypeRegisteredEvent[]> {
		const from = fromBlock
			? fromBlock
			: (await erdstall.bigBang()).toNumber();

		const filter = erdstall.filters.TokenTypeRegistered(null, null);
		return erdstall.queryFilter(filter, from).then((ev) => {
			return ev.map((entry) => {
				// FIXME: Check that `ttype` is really a `TokenType`.
				const ttype = entry.args.tokenType as TokenType;
				const tokenHolder = entry.args.tokenHolder;

				if (!this.holderCache.has(ttype)) {
					this.holderCache.set(ttype, tokenHolder);
				}

				return {
					tokenType: ttype,
					tokenHolder: tokenHolder,
				};
			});
		});
	}

	// queryRegisteredTokens queries the registered tokens from the
	// erdstall-contract. It also updates the tokentype cache accordingly.
	async queryRegisteredTokens(
		erdstall: Erdstall,
		fromBlock?: number,
	): Promise<TokenRegisteredEvent[]> {
		const from = fromBlock
			? fromBlock
			: (await erdstall.bigBang()).toNumber();

		const filter = erdstall.filters.TokenRegistered(null, null, null);
		return erdstall.queryFilter(filter, from).then((ev) => {
			return ev.map((entry) => {
				const token = entry.args.token;
				// FIXME: Check that `ttype` is really a `TokenType`.
				const ttype = entry.args.tokenType as TokenType;
				const tokenHolder = entry.args.tokenHolder;

				if (!this.typeCache.has(token)) {
					this.setType(token, ttype);
				}

				if (!this.holderCache.has(ttype)) {
					this.holderCache.set(ttype, tokenHolder);
				}

				return {
					token: token,
					tokenType: ttype,
					tokenHolder: tokenHolder,
				};
			});
		});
	}

	resolveTokenType(
		signer: Signer,
		ttype: TokenType,
		token: string,
	): Responder {
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
