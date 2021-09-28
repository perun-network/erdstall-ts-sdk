// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";

import { Wallet } from "ethers";
import { ETHZERO, Amount, Asset } from "#erdstall/ledger/assets";
import { Address } from "#erdstall/ledger";
import {
	makeETHDepositCalls,
	makeERC20DepositCalls,
	makeERC721DepositCalls,
} from "./contracts_deposit";
import { DepositerCallsFactory } from "./tokenmanager";
import { PerunArt__factory } from "./contracts/factories/PerunArt__factory";

import { Enviroment, setupEnv } from "#erdstall/test/ledger";
import * as test from "#erdstall/test";

const TOKEN_SIZE = 4;

describe("Deposit_Call_Wrapper", () => {
	const rng = test.newPrng();
	let testenv: Enviroment;
	let bob: Wallet;
	const amount = new Amount(test.newRandomBigInt(rng, 16));
	const tokens = test.newRandomTokens(rng, TOKEN_SIZE);

	before(async () => {
		testenv = await setupEnv();
		bob = testenv.users[0];

		const part = PerunArt__factory.connect(testenv.perunArt, bob);
		for (const id of tokens.value) {
			await part.mint(bob.address, id);
		}
	});

	it("allows deposits for ETH, ERC20 and ERC721", async () => {
		let nonce = await bob.getTransactionCount();

		const testCases: [DepositerCallsFactory, string, string, Asset][] = [
			[makeETHDepositCalls, testenv.ethHolder, ETHZERO, amount],
			[makeERC20DepositCalls, testenv.erc20Holder, testenv.perun, amount],
			[
				makeERC721DepositCalls,
				testenv.erc721Holder,
				testenv.perunArt,
				tokens,
			],
		];

		for (const [call, holder, token, assets] of testCases) {
			const depCall = (call as DepositerCallsFactory)(
				bob,
				Address.fromString(holder),
				Address.fromString(token),
				assets,
			);
			for (const [_, call] of depCall) {
				const tx = await call({ nonce: nonce++ });
				const txr = await tx.wait();
				expect(
					txr.status,
					`${token} deposit should succeed`,
				).to.be.equal(0x1);
			}
		}
	});
});
