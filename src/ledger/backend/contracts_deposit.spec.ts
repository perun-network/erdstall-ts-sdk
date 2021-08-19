// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";

import { Wallet } from "ethers";
import { ETHZERO, Amount } from "#erdstall/ledger/assets";
import { Address } from "#erdstall/ledger";
import {
	makeETHDepositCalls,
	makeERC20DepositCalls,
	makeERC721DepositCalls,
} from "./contracts_deposit";

import { Enviroment, setupEnv } from "#erdstall/test/ledger";

describe("Deposit_Call_Wrapper", () => {
	let testenv: Enviroment;
	let bob: Wallet;
	const amount = new Amount(100n);

	before(async () => {
		testenv = await setupEnv();
		bob = testenv.users[0];
	});

	it("allows deposits for ETH, ERC20 and ERC721", async () => {
		let nonce = await bob.getTransactionCount();

		[
			[makeETHDepositCalls, testenv.ethHolder, ETHZERO],
			[makeERC20DepositCalls, testenv.erc20Holder, testenv.perun],
		].forEach(async ([call, holder, token]) => {
			const depCall = (call as typeof makeERC20DepositCalls)(
				bob,
				Address.fromString(holder as string),
				Address.fromString(token as string),
				amount,
			);
			for (const [_, call] of depCall) {
				const tx = await call({ nonce: nonce++ });
				const txr = await tx.wait();
				expect(
					txr.status,
					`${token} deposit should succeed`,
				).to.be.equal(0x1);
			}
		});
	});
});
