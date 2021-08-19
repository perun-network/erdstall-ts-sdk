// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { utils } from "ethers";

import { Address } from "#erdstall/ledger";
import {
	Erdstall,
	Erdstall__factory,
} from "#erdstall/ledger/backend/contracts";

import * as test from "#erdstall/test";
import { Enviroment, setupEnv } from "#erdstall/test/ledger";
import { equalArray } from "#erdstall/utils/arrays";

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
});
