// SPDX-License-Identifier: Apache-2.0

import chai from "chai";
import { solidity } from "ethereum-waffle";

import {
	Erdstall,
	Erdstall__factory,
} from "#erdstall/ledger/backend/ethereum/contracts";

import * as test from "#erdstall/test";
import { Environment, setupEnv } from "#erdstall/test/ledger";
import { logSeedOnFailure } from "#erdstall/test";

chai.use(solidity);

describe("BalanceProofs", function () {
	const rng = test.newPrng();
	let env: Environment;
	let erd: Erdstall;

	before(async function () {
		env = await setupEnv();
		erd = Erdstall__factory.connect(env.erdstall, env.provider);
	});

	// TODO: Reintroduce tests here.

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});
