// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";

import { Wallet } from "ethers";
import { PerunArt__factory } from "./contracts";
import { ETHZERO, Assets, Amount } from "#erdstall/ledger/assets";
import { EventHelper } from "#erdstall/utils";

import { Erdstall__factory } from "./contracts";
import { LedgerWriteConn } from "./writeconn";
import { Enviroment, setupEnv } from "#erdstall/test/ledger";

import * as test from "#erdstall/test";

const TOKEN_SIZE = 4;

describe("ErdstallConnection", () => {
	const rng = test.newPrng();
	let testenv: Enviroment;
	let bob: Wallet;
	const amount = new Amount(10n);
	const tokens = test.newRandomTokens(rng, TOKEN_SIZE);

	before(async () => {
		testenv = await setupEnv();
		bob = testenv.users[0];

		const part = PerunArt__factory.connect(testenv.perunArt, bob);
		for (const id of tokens.value) {
			await part.mint(bob.address, id);
		}
	});

	it("allows interfacing with the erdstall contract", async () => {
		const assets = new Assets();
		assets.addAsset(testenv.perun, amount);
		assets.addAsset(ETHZERO, amount);
		assets.addAsset(testenv.perunArt, tokens);
		const contract = Erdstall__factory.connect(testenv.erdstall, bob);

		const conn = new LedgerWriteConn(contract);
		const depositRegistered = EventHelper.within(10000, conn, "Deposited");

		const stages = await conn.deposit(assets);
		for (const stage of stages) {
			const ctx = await stage.value;
			const rec = await ctx.wait();
			expect(rec.status, "depositing should have worked").to.equal(0x1);
		}

		return depositRegistered;
	});
});
