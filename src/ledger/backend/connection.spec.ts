// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";

import { Erdstall__factory } from "./contracts";
import { LedgerAdapter } from "./connection";
import { ETHZERO, Assets, Amount } from "../assets";

import setup, { Enviroment } from "./enviroment.spec";

describe("ErdstallConnection", () => {
	let testenv: Enviroment;
	const BOB = 0;
	const amount = new Amount(10n);

	before(async () => {
		testenv = await setup();
	});

	it("allows interfacing with the erdstall contract", async () => {
		const assets = new Assets();
		assets.addAsset(testenv.perun, amount);
		assets.addAsset(ETHZERO, amount);
		const contract = Erdstall__factory.connect(
			testenv.erdstall,
			testenv.users[BOB],
		);

		let testTimeout: NodeJS.Timeout;
		let cb: Function;
		const conn = new LedgerAdapter(contract);
		const depositRegistered = new Promise<boolean>((resolve, reject) => {
			testTimeout = setTimeout(reject, 10000);
			cb = () => {
				resolve(true);
			};
			conn.on("Deposited", cb);
		});

		const txs = await conn.deposit(assets);
		for (const tx of txs) {
			const rec = await tx.wait();
			expect(rec.status, "depositing should have worked").to.equal(0x1);
		}

		return depositRegistered.finally(() => {
			clearTimeout(testTimeout);
			conn.off("Deposited", cb);
		});
	});
});
