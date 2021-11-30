// SPDX-License-Identifier: Apache-2.0
"use strict";

import "reflect-metadata";
import { expect } from "chai";
import { Address } from "#erdstall/ledger";
import * as test from "#erdstall/test";
import { logSeedOnFailure } from "#erdstall/test";

describe("Signatures", () => {
	const rng = test.newPrng();
	const wallet = test.newRandomWallet(rng);

	it("works for transactions", async () => {
		const contract = test.newRandomAddress(rng);
		const tx = test.newRandomTransfer(rng, 1);
		tx.sender = Address.fromString(wallet.address);
		await tx.sign(contract, wallet);

		expect(tx.verify(contract)).to.be.true;
	});

	it("works for mints", async () => {
		const contract = test.newRandomAddress(rng);
		const tx = test.newRandomMint(rng);
		tx.sender = Address.fromString(wallet.address);
		await tx.sign(contract, wallet);
		expect(tx.verify(contract)).to.be.true;
	});

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});
