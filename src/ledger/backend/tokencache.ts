// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer } from "ethers";
import { Address } from "#erdstall/ledger";
import { TokenRegistered, TokenTypeRegistered } from "#erdstall/ledger";
import { TokenType, requireTokenType, ETHZERO } from "#erdstall/ledger/assets";
import { Erdstall, ERC20__factory, ERC721__factory } from "./contracts";

interface Responder {
	symbol(): Promise<string>;
}

export interface TokenProvider {
	setType(tokenAddr: string, ttype: TokenType): void;
	tokenHolderFor(erdstall: Erdstall, ttype: TokenType): Promise<string>;
	tokenTypeOf(erdstall: Erdstall, tokenAddr: string): Promise<TokenType>;
	findRegisteredTokenWithSymbol(
		erdstall: Erdstall,
		symbol: string,
		fromBlock?: number,
	): Promise<Address | undefined>;
	queryRegisteredTokenTypes(
		erdstall: Erdstall,
		fromBlock?: number,
	): Promise<TokenTypeRegistered[]>;
	queryRegisteredTokens(
		erdstall: Erdstall,
		fromBlock?: number,
	): Promise<TokenRegistered[]>;
}

type TokenTypes = Map<string, TokenType>;
type TokenHolders = Map<TokenType, string>;

export class TokenFetcher implements TokenProvider {
	readonly typeCache: TokenTypes;
	readonly holderCache: TokenHolders;
	private bigbang?: number;

	constructor() {
		this.typeCache = new Map<string, TokenType>();
		this.typeCache.set(ETHZERO, "ETH");
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
	): Promise<Address | undefined> {
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
					requireTokenType(ev.tokenType),
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
	): Promise<TokenTypeRegistered[]> {
		const from = fromBlock
			? fromBlock
			: (await erdstall.bigBang()).toNumber();

		const filter = erdstall.filters.TokenTypeRegistered(null, null);
		return erdstall.queryFilter(filter, from).then((ev) => {
			return ev.map((entry) => {
				const ttype = requireTokenType(entry.args.tokenType);
				const tokenHolder = entry.args.tokenHolder;

				if (!this.holderCache.has(ttype)) {
					this.holderCache.set(ttype, tokenHolder);
				}

				return {
					tokenType: ttype,
					tokenHolder: Address.fromString(tokenHolder),
				};
			});
		});
	}

	// queryRegisteredTokens queries the registered tokens from the
	// erdstall-contract. It also updates the tokentype cache accordingly.
	async queryRegisteredTokens(
		erdstall: Erdstall,
		fromBlock?: number,
	): Promise<TokenRegistered[]> {
		const from = fromBlock
			? fromBlock
			: (await erdstall.bigBang()).toNumber();

		const filter = erdstall.filters.TokenRegistered(null, null, null);
		return erdstall.queryFilter(filter, from).then((ev) => {
			return ev.map((entry) => {
				const token = entry.args.token;
				const ttype = requireTokenType(entry.args.tokenType);
				const tokenHolder = entry.args.tokenHolder;

				if (!this.typeCache.has(token)) {
					this.setType(token, ttype);
				}

				if (!this.holderCache.has(ttype)) {
					this.holderCache.set(ttype, tokenHolder);
				}

				return {
					token: Address.fromString(token),
					tokenType: ttype,
					tokenHolder: Address.fromString(tokenHolder),
				};
			});
		});
	}

	resolveTokenType(
		signer: Signer,
		ttype: TokenType,
		token: string | Address,
	): Responder {
		const token_s = token instanceof Address ? token.toString() : token;
		switch (ttype) {
			case "ERC20":
				return ERC20__factory.connect(token_s, signer);
			case "ERC721":
				return ERC721__factory.connect(token_s, signer);
			case "ERC721Mintable":
				return ERC721__factory.connect(token_s, signer);
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
