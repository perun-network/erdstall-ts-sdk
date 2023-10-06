// SPDX-License-Identifier: Apache-2.0
"use strict";

import { TokenType } from "#erdstall/ledger/backend/tokentype";
import { BackendAddress } from "#erdstall";
import { TokenTypeRegistered } from "#erdstall/ledger";
import { Backend, ErdstallConnector } from "#erdstall/ledger/backend";

/**
 * Describes an entity with the ability to query token information related to
 * Erdstall and its onchain contracts for a specific backend.
 */
export interface TokenProvider<B extends Backend> {
	/**
	 * Sets the locally cached token type for the given token address.
	 *
	 * @param tokenAddr - The address of the token to update.
	 * @param ttype - The token type.
	 */
	setType(tokenAddr: string, ttype: TokenType<B>): void;
	/**
	 * Retrieves the address of the token holder contract for the given token
	 * type related to the given Erdstall contract.
	 *
	 * @param erdstall - The Erdstall contract connector, which is dependent on
	 * the backend the TokenProvider is called with.
	 * @param ttype - The token type which is handled by some holder contract.
	 * @throws An error when no token holder contract is registered for the given
	 * token type.
	 * @returns The address of the holder contract in string representation.
	 */
	tokenHolderFor(
		erdstall: ErdstallConnector<B>,
		ttype: TokenType<B>,
	): Promise<string>;
	/**
	 * Retrieves the token type for a given token address related to the given
	 * Erdstall contract.
	 *
	 * @param erdstall - The Erdstall contract connector, which is dependent on
	 * the backend the TokenProvider is called with.
	 * @param tokenAddr - The address of a token contract.
	 * @throws An error when the given token address is not registered with the
	 * Erdstall contract.
	 * @returns The token type of the given token address.
	 */
	tokenTypeOf(
		erdstall: ErdstallConnector<B>,
		tokenAddr: string,
	): Promise<TokenType<B>>;
	/**
	 * Finds the address of the first registered token contract in Erdstall,
	 * which has the given symbol as its symbol according to the ERC20Detailed
	 * specification.
	 *
	 * @param erdstall - The Erdstall contract connector, which is dependent on
	 * the backend the TokenProvider is called with.
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
		erdstall: ErdstallConnector<B>,
		symbol: string,
		fromBlock?: number,
	): Promise<BackendAddress<Backend> | undefined>;
	/**
	 * Queries the registered token types on the given Erdstall contract.
	 *
	 * @param erdstall - The Erdstall contract connector, which is dependent on
	 * the backend the TokenProvider is called with.
	 * @param fromBlock - When omitted the starting block from when the Erdstall
	 * contract was deployed will be used.
	 * @returns A list of TokenTypeRegistered events, which might be empty if no
	 * token types were registered.
	 */
	queryRegisteredTokenTypes(
		erdstall: ErdstallConnector<B>,
		fromBlock?: number,
	): Promise<TokenTypeRegistered<B>[]>;
}
