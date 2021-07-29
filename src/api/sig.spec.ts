// SPDX-License-Identifier: Apache-2.0
"use strict";

import "reflect-metadata";
import { expect } from "chai";
import { MockProvider } from "ethereum-waffle";
import { Address } from "#erdstall/ledger";
import * as test from "#erdstall/test";

const gProvider = new MockProvider();
const wallets = gProvider.getWallets();

describe("Signatures", () => {
	const rng = test.NewPrng();
	it("works for transactions", async () => {
		const contract = test.NewRandomAddress(rng);
		const tx = test.NewRandomTransfer(rng, 1);
		tx.sender = Address.fromString(wallets[0].address);
		await tx.sign(contract, wallets[0]);

		expect(tx.verify(contract)).to.be.true;
	});

	it("works for mints", async () => {
		const contract = test.NewRandomAddress(rng);
		const tx = test.NewRandomMint(rng);
		tx.sender = Address.fromString(wallets[0].address);
		await tx.sign(contract, wallets[0]);
		expect(tx.verify(contract)).to.be.true;
	});
});
