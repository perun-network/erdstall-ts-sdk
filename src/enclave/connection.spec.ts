// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";
import { Enclave } from "./connection";
import { EnclaveEvent } from "./event";
import { EnclaveMockProvider } from "#erdstall/test/mocks";

import * as pkgtest from "#erdstall/test";
import { logSeedOnFailure } from "#erdstall/test";

describe("EnclaveConnection", () => {
	const rng = pkgtest.newPrng();
	const assetsSize = 4;
	const provider = new EnclaveMockProvider();

	it("sends correctly formatted transactions", async () => {
		const conn = new Enclave(provider);
		conn.connect();
		expect(() =>
			conn.subscribe(pkgtest.newRandomAddress(rng)),
		).does.not.throw();
		expect(() =>
			conn.transfer(pkgtest.newRandomTransfer(rng, assetsSize)),
		).does.not.throw();
		expect(() => conn.mint(pkgtest.newRandomMint(rng))).does.not.throw();
		expect(() =>
			conn.exit(pkgtest.newRandomExitRequest(rng)),
		).does.not.throw();
		expect(() =>
			conn.getAccount(pkgtest.newRandomAddress(rng)),
		).does.not.throw();
	});

	it("allows subscribing to phaseshifts", async () => {
		const conn = new Enclave(provider);
		const sendPhaseShiftToClient = () =>
			provider.sendToClient(pkgtest.newRandomPhaseShift(rng));
		conn.connect();

		testRecurrentEventSubs(conn, "phaseshift", sendPhaseShiftToClient);
		testOnceEventSubs(conn, "phaseshift", sendPhaseShiftToClient);
	});

	it("allows subscribing to balanceproofs", async () => {
		const conn = new Enclave(provider);
		const sendBPtoClient = () =>
			provider.sendToClient(
				pkgtest.newRandomBalanceProofs(rng, assetsSize, 1),
			);
		const sendEPtoClient = () =>
			provider.sendToClient(
				pkgtest.newRandomExitProofs(rng, assetsSize, 1),
			);

		conn.connect();

		testRecurrentEventSubs(conn, "proof", sendBPtoClient);
		testOnceEventSubs(conn, "proof", sendBPtoClient);

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
			const exitPromise = conn.exit(pkgtest.newRandomExitRequest(rng));

			sendBPtoClient(); // balanceProof which should not trigger the exit request.
			sendEPtoClient();

			const returnedEP = await exitPromise;
			expect(
				returnedEP.balance.exit,
				"the returned exitproof should be a valid exitproof",
			).to.be.true;
		}
	});

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});

function testRecurrentEventSubs(
	conn: Enclave,
	eventName: EnclaveEvent,
	sendPayloadToClient: () => void,
) {
	let calledCounter = 0;
	const cb = () => {
		calledCounter++;
	};
	conn.on(eventName, cb);

	for (let i = 0; i < 10; i++) {
		sendPayloadToClient();
	}

	expect(
		calledCounter,
		`receiving 10 payloads for ${eventName}, should trigger the eventhandler 10 times`,
	).equals(10);

	conn.off(eventName, cb);

	for (let i = 0; i < 10; i++) {
		sendPayloadToClient();
	}

	expect(
		calledCounter,
		`turning the ${eventName} subscription off should not trigger the callback anymore`,
	).equals(10);
}

function testOnceEventSubs(
	conn: Enclave,
	eventName: EnclaveEvent,
	sendPayloadToClient: () => void,
) {
	// `once` subscription are only executed a single time.
	let calledCounter = 0;
	conn.once(eventName, () => {
		calledCounter++;
	});

	for (let i = 0; i < 10; i++) {
		sendPayloadToClient();
	}

	expect(
		calledCounter,
		"registering a one shot event is only executed once",
	).equals(1);
}
