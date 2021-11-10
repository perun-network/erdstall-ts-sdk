// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";

import { Wallet } from "ethers";
import { PerunArt__factory } from "./contracts";
import {
	ETHZERO,
	Assets,
	Amount,
	Tokens,
	TypeTags,
} from "#erdstall/ledger/assets";
import { EventHelper } from "#erdstall/utils";
import { Balance } from "#erdstall/api/responses";

import { Erdstall__factory, Erdstall } from "./contracts";
import { LedgerWriteConn, LedgerWriter } from "./writeconn";
import { TokenFetcher } from "./tokencache";
import { Environment, setupEnv } from "#erdstall/test/ledger";

import * as test from "#erdstall/test";

const TOKEN_SIZE = 4;

describe("ErdstallConnection", () => {
	const rng = test.newPrng();
	let testenv: Environment;
	let bob: Wallet;
	const amount = new Amount(10n);
	const tokens = test.newRandomTokens(rng, TOKEN_SIZE);
	const assets = new Assets();
	let contract: Erdstall;
	let conn: LedgerWriter;

	const depositStagesForAssets = (assets: Assets): number => {
		let result = 0;
		assets.values.forEach((asset, token) => {
			switch (asset.typeTag()) {
				case TypeTags.Amount:
					// ETHZERO -> one onchain transfer.
					// ERC20 -> one onchain approve + one onchain transfer.
					result += token === ETHZERO ? 1 : 2;
					break;
				case TypeTags.Tokens:
					// ERC721 -> Tokens.length onchain approves + one onchain transfer.
					result += (asset as Tokens).value.length + 1;
					break;
			}
		});
		return result;
	};

	before(async () => {
		testenv = await setupEnv();
		bob = testenv.users[0];

		const part = PerunArt__factory.connect(testenv.perunArt, bob);
		for (const id of tokens.value) {
			await part.mint(bob.address, id);
		}

		assets.addAsset(testenv.perun, amount);
		assets.addAsset(ETHZERO, amount);
		assets.addAsset(testenv.perunArt, tokens);
		contract = Erdstall__factory.connect(testenv.erdstall, bob);
		conn = new LedgerWriteConn(contract, new TokenFetcher());
	});

	it("allows depositing into the erdstall contract", async () => {
		const depositRegistered = EventHelper.within(10000, conn, "Deposited");

		const { stages, numStages } = await conn.deposit(assets);
		for await (const [_name, tx] of stages) {
			const rec = await tx.wait();
			expect(rec.status, "depositing should have worked").to.equal(0x1);
		}

		expect(numStages).to.equal(depositStagesForAssets(assets));

		return depositRegistered;
	});

	it("allows withdrawing from the erdstall contract", async () => {
		const withdrawRegistered = EventHelper.within(10000, conn, "Withdrawn");

		const bal = new Balance(
			0n, // epoch
			bob.address, // account
			true, // exit
			assets,
		);
		const bp = await bal.sign(conn.erdstall(), testenv.tee);
		const { stages, numStages } = await conn.withdraw(bp);
		for await (const [_name, tx] of stages) {
			const rec = await tx.wait();
			expect(rec.status, "withdrawing should have worked").to.equal(0x1);
		}
		expect(numStages).to.equal(1);
		return withdrawRegistered;
	});
});
