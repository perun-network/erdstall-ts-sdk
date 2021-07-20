// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";
import { Wallet } from "ethers";

import { Erdstall__factory } from "#erdstall/ledger/backend/contracts";
import { TokenType, ETHZERO } from "#erdstall/ledger/assets";
import { TokenTypesCache } from "#erdstall/ledger/backend/tokencache";

import setup, { Enviroment } from "#erdstall/ledger/backend/enviroment.spec";

describe("Tokencache", () => {
	let testenv: Enviroment;
	let bob: Wallet;

	before(async () => {
		testenv = await setup();
		bob = testenv.users[0];
	});

	it("fetches registered tokens and tokenholders from erdstall", async () => {
		const erdstall = Erdstall__factory.connect(testenv.erdstall, bob);
		const cache = new TokenTypesCache();

		const testInputHolders = [
			["ETH", testenv.ethHolder],
			["ERC20", testenv.erc20Holder],
			["ERC721", testenv.erc721Holder],
		] as [TokenType, string][];

		for (const [ttype, expectedAddress] of testInputHolders) {
			expect(
				await cache.tokenHolderFor(erdstall, ttype),
				`tokenholder for ${ttype} should be retrieved by tokentypescache`,
			).equals(expectedAddress);
		}

		const testInputTokens = [
			[testenv.perun, "ERC20"],
			[ETHZERO, "ETH"],
		] as [string, TokenType][];

		for (const [token, expectedType] of testInputTokens) {
			expect(
				await cache.tokenTypeOf(erdstall, token),
				`tokentype for ${token} should be retrieved by tokentypescache`,
			).equals(expectedType);
		}

		expect(
			await cache.resolveTokenType(bob, "ERC20", testenv.perun).symbol(),
			"retrieving the symbol for tokens should work",
		).equals("PRN");

		expect(
			await cache.findRegisteredTokenWithSymbol(erdstall, "PRN"),
			"finding the symbol of a registered token should work",
		).equals(testenv.perun);
	});
});
