// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { utils } from "ethers";

import { Address } from "#erdstall/ledger";
import {
	Erdstall,
	Erdstall__factory,
} from "#erdstall/ledger/backend/ethereum/contracts";

import * as test from "#erdstall/test";
import { Environment, setupEnv } from "#erdstall/test/ledger";
import { equalArray } from "#erdstall/utils/arrays";
import { logSeedOnFailure } from "#erdstall/test";

chai.use(solidity);

describe("BalanceProofs", function () {
	const rng = test.newPrng();
	let env: Environment;
	let erd: Erdstall;
	let erdAddr: Address;

	before(async function () {
		env = await setupEnv();
		erd = Erdstall__factory.connect(env.erdstall, env.provider);
		erdAddr = Address.fromString(env.erdstall);
	});

	it("should be correctly encoded", async function () {
		const bp = test.newRandomBalance(rng, 3);
		const bpEnc = bp.packTagged(erdAddr).bytes;
		const bpContractEnc = utils.arrayify(
			await erd.encodeBalanceProof(bp.asABI()),
		);
		expect(equalArray(bpEnc, bpContractEnc)).to.be.true;
	});

	it("should be correctly signed", async function () {
		const bal = test.newRandomBalance(rng, 3);
		const bp = await bal.sign(erdAddr, env.tee);
		return expect(erd.verifyBalance(bal.asABI(), bp.sig.value)).to.not.be
			.reverted;
	});

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});
