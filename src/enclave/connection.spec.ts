// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";
import { Enclave } from "./connection";
import { EnclaveMockProvider } from "./provider.spec";

import * as pkgtest from "../../test";

describe("EnclaveConnection", () => {
	const rng = pkgtest.NewPrng();
	const assetsSize = 4;
	const provider = new EnclaveMockProvider();

	it("sends correctly formatted transactions", async () => {
		const conn = new Enclave(provider);
		conn.connect();
		expect(() =>
			conn.subscribe(pkgtest.NewRandomAddress(rng)),
		).does.not.throw();
		expect(() =>
			conn.transfer(pkgtest.NewRandomTransfer(rng, assetsSize)),
		).does.not.throw();
		expect(() => conn.mint(pkgtest.NewRandomMint(rng))).does.not.throw();
		expect(() =>
			conn.exit(pkgtest.NewRandomExitRequest(rng)),
		).does.not.throw();
		expect(() =>
			conn.getAccount(pkgtest.NewRandomAddress(rng)),
		).does.not.throw();
	});

	it("allows subscribing to balanceproofs", async () => {
		const conn = new Enclave(provider);
		const sendBPtoClient = () =>
			provider.sendToClient(
				pkgtest.NewRandomBalanceProof(rng, assetsSize),
			);
		const sendEPtoClient = () =>
			provider.sendToClient(pkgtest.NewRandomExitProof(rng, assetsSize));

		conn.connect();

		{
			// recurrent event subs are executed as expected.
			let calledCounter = 0;
			const cb = () => {
				calledCounter++;
			};
			conn.on("proof", cb);

			for (let i = 0; i < 10; i++) {
				sendBPtoClient();
			}

			expect(
				calledCounter,
				"receiving 10 proofs, should trigger the eventhandler 10 times",
			).equals(10);

			conn.off("proof", cb);

			for (let i = 0; i < 10; i++) {
				sendBPtoClient();
			}

			expect(
				calledCounter,
				"turning the subscription off should not trigger the callback anymore",
			).equals(10);
		}

		{
			// `once` subscription are only executed a single time.
			let calledCounter = 0;
			conn.once("proof", () => {
				calledCounter++;
			});

			for (let i = 0; i < 10; i++) {
				sendBPtoClient();
			}

			expect(
				calledCounter,
				"registering a one shot transaction is only executed once",
			).equals(1);
		}

		{
			let exitedCalled = false;
			// subscribing to exitproofs works.
			conn.once("exitproof", () => {
				exitedCalled = true;
			});

			sendBPtoClient();
			expect(
				exitedCalled,
				"exit callback should not be triggered by normal balanceproofs",
			).to.be.false;

			sendEPtoClient();
			expect(
				exitedCalled,
				"exit callback should be triggered by an exitproof",
			).to.be.true;
		}

		{
			// exiting over the connection returns an exitproof and is not triggered
			// by normal balanceproofs.
			const exitPromise = conn.exit(pkgtest.NewRandomExitRequest(rng));

			sendBPtoClient(); // balanceProof which should not trigger the exit request.
			sendEPtoClient();

			const returnedEP = await exitPromise;
			expect(
				returnedEP.balance.exit,
				"the returned exitproof should be a valid exitproof",
			).to.be.true;
		}
	});
});
