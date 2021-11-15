// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer } from "ethers";
import { Address, addressKey } from "#erdstall/ledger";
import { TokenRegistered, TokenTypeRegistered } from "#erdstall/ledger";
import { TokenType, requireTokenType, ETHZERO } from "#erdstall/ledger/assets";
import { Erdstall, ERC20__factory, ERC721__factory } from "./contracts";

interface Responder {
	symbol(): Promise<string>;
}

/**
 * Describes an entity with the ability to query token information related to
 * Erdstall and its onchain contracts.
 */
export interface TokenProvider {
	/**
	 * Sets the locally cached token type for the given token address.
	 *
	 * @param tokenAddr - The address of the token to update.
	 * @param ttype - The token type.
	 */
	setType(tokenAddr: string, ttype: TokenType): void;
	/**
	 * Retrieves the address of the token holder contract for the given token
	 * type related to the given Erdstall contract.
	 *
	 * @param erdstall - The Erdstall contract.
	 * @param ttype - The token type which is handled by some holder contract.
	 * @throws An error when no token holder contract is registered for the given
	 * token type.
	 * @returns The address of the holder contract in string representation.
	 */
	tokenHolderFor(erdstall: Erdstall, ttype: TokenType): Promise<string>;
	/**
	 * Retrieves the token type for a given token address related to the given
	 * Erdstall contract.
	 *
	 * @param erdstall - The Erdstall contract.
	 * @param tokenAddr - The address of a token contract.
	 * @throws An error when the given token address is not registered with the
	 * Erdstall contract.
	 * @returns The token type of the given token address.
	 */
	tokenTypeOf(erdstall: Erdstall, tokenAddr: string): Promise<TokenType>;
	/**
	 * Finds the address of the first registered token contract in Erdstall,
	 * which has the given symbol as its symbol according to the ERC20Detailed
	 * specification.
	 *
	 * @param erdstall - The Erdstall contract.
	 * @param symbol - The symbol to search for.
	 * @param fromBlock - When omitted the starting block from when the Erdstall
	 * contract was deployed will be used.
	 * @returns The address when a token contract matching the symbol could be
	 * found, otherwise undefined.
	 *
	 * @remarks
	 * [ERC20Detailed](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.1/contracts/token/ERC20/ERC20Detailed.sol)
	 */
	findRegisteredTokenWithSymbol(
		erdstall: Erdstall,
		symbol: string,
		fromBlock?: number,
	): Promise<Address | undefined>;
	/**
	 * Queries the registered token types on the given Erdstall contract.
	 *
	 * @param erdstall - The Erdstall contract.
	 * @param fromBlock - When omitted the starting block from when the Erdstall
	 * contract was deployed will be used.
	 * @returns A list of TokenTypeRegistered events, which might be empty if no
	 * token types were registered.
	 */
	queryRegisteredTokenTypes(
		erdstall: Erdstall,
		fromBlock?: number,
	): Promise<TokenTypeRegistered[]>;
	/**
	 * Queries the registered tokens on the given Erdstall contract.
	 *
	 * @param erdstall - The Erdstall contract.
	 * @param fromBlock - When omitted the starting block from when the Erdstall
	 * contract was deployed will be used.
	 * @returns A list of TokenRegistered events, which might be empty if no
	 * tokens were registered.
	 */
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
			Promise.reject(
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
				const token = addressKey(entry.args.token);
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
		token = addressKey(token);
		switch (ttype) {
			case "ERC20":
				return ERC20__factory.connect(token, signer);
			case "ERC721":
				return ERC721__factory.connect(token, signer);
			case "ERC721Mintable":
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
