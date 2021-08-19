// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { utils } from "ethers";

import { Address } from "#erdstall/ledger";
import {
	Erdstall,
	Erdstall__factory,
} from "#erdstall/ledger/backend/contracts";

import * as test from "#erdstall/test";
import { Enviroment, setupEnv } from "#erdstall/test/ledger";
import { equalArray } from "#erdstall/utils/arrays";

chai.use(solidity);

describe("BalanceProofs", function () {
	const rng = test.NewPrng();
	let env: Enviroment;
	let erd: Erdstall;
	let erdAddr: Address;

	before(async function () {
		env = await setupEnv();
		erd = Erdstall__factory.connect(env.erdstall, env.provider);
		erdAddr = Address.fromString(env.erdstall);
	});

	it("should be correctly encoded", async function () {
		const bp = test.NewRandomBalance(rng, 3);
		const bpEnc = bp.packTagged(erdAddr).bytes;
		const bpContractEnc = utils.arrayify(
			await erd.encodeBalanceProof(bp.asABI()),
		);
		expect(equalArray(bpEnc, bpContractEnc)).to.be.true;
	});

	it("should be correctly signed", async function () {
		const bal = test.NewRandomBalance(rng, 3);
		const bp = await bal.sign(erdAddr, env.tee);
		return expect(erd.verifyBalance(bal.asABI(), bp.sig.value)).to.not.be
			.reverted;
	});
});
