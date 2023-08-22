// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";
import { Client, ErdstallClient } from "#erdstall";
import { ClientConfig } from "#erdstall/api/responses";
import { Enclave } from "#erdstall/enclave";
import { Address } from "#erdstall/ledger";
import { PerunArt__factory } from "#erdstall/ledger/backend/ethereum/contracts";
import * as test from "#erdstall/test";
import { Environment, setupEnv, PERUNART_URI } from "#erdstall/test/ledger";
import nock from "nock";
import { logSeedOnFailure } from "#erdstall/test";

describe("NFTMetadata", function () {
	const rng = test.newPrng();
	let testenv: Environment;
	let erdstall: ErdstallClient;
	let token: Address;
	const id = test.newRandomUint256(rng);

	before(async () => {
		testenv = await setupEnv();
		const bob = testenv.users[0];
		token = Address.fromString(testenv.perunArt);

		const config = new ClientConfig(
			Address.fromString(testenv.erdstall),
			"420",
			69,
		);
		const conn = new Enclave(new test.EnclaveMockProvider(config));
		erdstall = new Client(testenv.provider, conn);
		await erdstall.initialize();

		const part = PerunArt__factory.connect(testenv.perunArt, bob);
		await part.mint(bob.address, id);
	});

	afterEach(function () {
		nock.cleanAll();
		logSeedOnFailure(rng, this.currentTest);
	});

	it("correctly queries the tokenURI", async function () {
		const metadata = test.newRandomMetadata(rng);
		nock(PERUNART_URI)
			.defaultReplyHeaders({ "access-control-allow-origin": "*" })
			.get(`/${token.key}/${id}`)
			.reply(200, metadata);
		let res = await erdstall.getNftMetadata(token, id);
		expect(res).to.deep.equal(metadata);

		// Second request should be cached, resulting in `nock` being unable to
		// intercept a GET request.
		nock(PERUNART_URI)
			.get(`/${token.key}/${id}`)
			.replyWithError("this should never be called");
		res = await erdstall.getNftMetadata(token, id);
		expect(res).to.deep.equal(metadata);

		// Clean up interception.
		nock.cleanAll();

		// Third request with a forced fetch should query the `tokenURI` again.
		nock(PERUNART_URI)
			.defaultReplyHeaders({ "access-control-allow-origin": "*" })
			.get(`/${token.key}/${id}`)
			.reply(200, { image: "foo" });
		res = await erdstall.getNftMetadata(token, id, false);
		expect(res).to.deep.equal({ image: "foo" });
	});
});
