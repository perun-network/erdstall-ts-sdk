// SPDX-License-Identifier: Apache-2.0
"use strict";

import "reflect-metadata";
import { expect } from "chai";
import {
	EthereumAddress as Address,
	EthereumSigner as Signer,
	EthereumSignature,
} from "#erdstall/crypto/ethereum";
import * as test from "#erdstall/test";
import { logSeedOnFailure } from "#erdstall/test";

describe("Signatures", () => {
	const rng = test.newPrng();
	const wallet = test.newRandomWallet(rng);
	const signer = new Signer(wallet);

	it("works", async () => {
		const msg = new Uint8Array([1,2,3]);
		const sig = await signer.sign(msg);
		expect(sig.verify(msg, await signer.address())).to.be.true;
	});

	it("matches go", async() => {
		const msg = new Uint8Array([48, 49, 50])
		const addr = Address.fromString(
			"0x53E866E5f1631A96cF2935e1e03561Aa82fDC72d") 
		const sig = EthereumSignature.fromJSON(
			"0xe17d4e4b997a9481ef9f3463b6b05af9a260a03d8d1d788c6d2ca23e0ce9dce025e3503b3f3498881bab23d04f1c8911161882a5d669074a40a45251612e532a1b");
		const v = sig.verify(msg, addr);

		expect(v).to.be.true;
	});

	it("works for transactions", async () => {
		const tx = test.newRandomTransfer(rng, 1);
		tx.sender = await signer.address();
		await tx.sign(signer);

		expect(tx.verify()).to.be.true;
	});

	it("works for mints", async () => {
		const tx = test.newRandomMint(rng);
		tx.sender = await signer.address();
		await tx.sign(signer);
		expect(tx.verify()).to.be.true;
	});

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});
