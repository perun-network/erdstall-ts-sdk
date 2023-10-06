// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";

import { Wallet } from "ethers";
import { Address, LedgerWriter } from "#erdstall/ledger";
import {
	ETHZERO,
	Asset,
	Assets,
	Amount,
	TokenType,
	ChainAssets,
} from "#erdstall/ledger/assets";
import { Balance } from "#erdstall/api/responses";

import { Erdstall__factory, Erdstall } from "./contracts";
import { LedgerWriteConn } from "./writeconn";
import { EthereumTokenProvider } from "./tokencache";
import { Environment, setupEnv } from "#erdstall/test/ledger";
import { ethCallbackShim, Listener } from "./ethwrapper";

import * as test from "#erdstall/test";
import { logSeedOnFailure } from "#erdstall/test";
import { EthereumAddress } from "./address";
import { Chain } from "#erdstall/ledger/chain";
import { TokenProvider } from "#erdstall/ledger/backend/tokenprovider";
import { EthereumSignature } from "./signature";

const TOKEN_SIZE = 4;
const TIMEOUT_MS = 15000;
const EPOCH_DURATION = 3;

describe("ErdstallEventWrapping", function () {
	const rng = test.newPrng();
	let testenv: Environment;
	let bob: Wallet;
	let bobAddr: Address<"ethereum">;
	const amount = new Amount(10n);
	const tokens = test.newRandomTokens(rng, TOKEN_SIZE);
	const oAssets = new ChainAssets(new Map());
	let bobContract: Erdstall;
	let opContract: Erdstall;
	let conn: LedgerWriter<"ethereum">;
	let tokenProvider: Pick<TokenProvider<"ethereum">, "tokenTypeOf">;
	let deposits: [string, Asset][] = [];
	const unusedTokenProvider: Pick<
		TokenProvider<"ethereum">,
		"tokenTypeOf"
	> = {
		tokenTypeOf: async (
			_erdstall: Erdstall,
			_token: string,
		): Promise<TokenType> => {
			throw new Error(
				"unexpected use of tokenProvider in callback implementation",
			);
		},
	};

	before(async () => {
		testenv = await setupEnv(1, EPOCH_DURATION);
		bob = testenv.users[0];
		bobAddr = EthereumAddress.fromString(bob.address);

		// TODO: Clean this up.
		const part: any = 0;
		// const part = PerunArt__factory.connect(testenv.perunArt, bob);
		// for (const id of tokens.value) {
		// 	await part.mint(bob.address, id);
		// }

		deposits = [
			[testenv.perun, amount],
			[ETHZERO, amount],
			[testenv.perunArt, tokens],
		];
		deposits.forEach(([token, value]) =>
			oAssets.addAsset(Chain.EthereumMainnet, token, value),
		);

		opContract = Erdstall__factory.connect(testenv.erdstall, testenv.op);
		bobContract = Erdstall__factory.connect(testenv.erdstall, bob);
		conn = new LedgerWriteConn(bobContract, new EthereumTokenProvider());
		tokenProvider = {
			tokenTypeOf: async (
				_erdstall: Erdstall,
				token: string,
			): Promise<TokenType> => {
				switch (token) {
					case ETHZERO:
						return "ETH";
					case testenv.perun:
						return "ERC20";
					default:
						throw new Error("unknown tokentype");
				}
			},
		};
	});

	let challengedEpoch = 0n;
	// TODO: Reintroduce
	//
	//it("wraps challenges", async function () {
	//	let timeout: NodeJS.Timeout;
	//	challengedEpoch = (await testenv.currentEpoch()) - 2n;

	//	const res = new Promise((resolve, reject) => {
	//		timeout = setTimeout(reject, TIMEOUT_MS);
	//		const wcb = ethCallbackShim(
	//			bobContract,
	//			unusedTokenProvider,
	//			"Challenged",
	//			({ address, epoch }) => {
	//				expect(address.equals(bobAddr)).to.be.true;
	//				// We challenged with proof for `epoch n` and are currently in `epoch
	//				// n+1`, which results in the challenge epoch to be offset by one.
	//				expect(epoch).to.equal(challengedEpoch + 1n);
	//				resolve(true);
	//			},
	//		);
	//		bobContract.once("Challenged", wcb);
	//	});

	//	const bal = new Balance(challengedEpoch, bobAddr, false, oAssets);
	//	const bp = await bal.sign(conn.erdstall(), testenv.tee);
	//	const [p, sig] = bp.toEthProof();
	//	const ctx = await bobContract.challenge(p, sig);
	//	const rec = await ctx.wait();
	//	expect(rec.status, "challenging should have worked").to.equal(0x1);

	//	return res.finally(() => {
	//		clearTimeout(timeout);
	//	});
	//});

	it("wraps challenge responses", async function () {
		let timeout: NodeJS.Timeout;
		let oSig: EthereumSignature;
		const wEpoch = challengedEpoch + 1n;

		// Seal the epoch in which we challenged before responding to challenge.
		await testenv.sealEpoch(wEpoch);
		const res = new Promise((resolve, reject) => {
			timeout = setTimeout(reject, TIMEOUT_MS);
			const wcb = ethCallbackShim(
				bobContract,
				tokenProvider,
				"ChallengeResponded",
				({ address, epoch, tokens, sig }) => {
					expect(address.equals(bobAddr)).to.be.true;
					expect(epoch).to.equal(wEpoch);
					expect(tokens.cmp(oAssets)).to.equal("eq");
					expect(sig.toString()).to.equal(oSig.toString());
					resolve(true);
				},
			);
			bobContract.once("ChallengeResponded", wcb);
		});

		const bal = new Balance(wEpoch, bobAddr, true, oAssets);
		// TODO: Reintroduce.
		//
		// bal.sign(conn.erdstall(), testenv.tee).then((bp) => {
		// 	const [p, s] = bp.toEthProof();
		// 	oSig = new Signature(s);
		// 	opContract.respondChallenge(p, s);
		// });
		return res.finally(() => {
			clearTimeout(timeout);
		});
	});

	// We deposit N assets, so we have will receive N deposit events. This has to
	// be done with a timeout promise, because we have to unsubscribe after N
	// events.
	it("wraps Deposits", async function () {
		let timeout: NodeJS.Timeout;
		let expectedNumOfEvents = deposits.length;
		let numOfEvents = 0;
		let wcb: Listener;

		const res = new Promise<boolean>((resolve, reject) => {
			timeout = setTimeout(reject, TIMEOUT_MS);
			wcb = ethCallbackShim(
				bobContract,
				tokenProvider,
				"Deposited",
				({ address, assets }) => {
					expect(address.equals(bobAddr)).to.be.true;
					expect(assets.cmp(oAssets)).to.equal("lt");

					numOfEvents++;
					if (numOfEvents === expectedNumOfEvents) resolve(true);
				},
			);
			bobContract.on("Deposited", wcb);
		});

		const { stages, numStages } = await conn.deposit("ethereum", oAssets);
		for await (const [name, stage] of stages) {
			const ctx = stage;
			const rec = await ctx.wait();
			expect(rec.status, "depositing should have worked").to.equal(0x1);
		}

		return res.finally(() => {
			clearTimeout(timeout);
			bobContract.off("Deposited", wcb);
		});
	});

	it("wraps withdrawals", async function () {
		let timeout: NodeJS.Timeout;
		const wEpoch = await testenv.currentEpoch();
		await testenv.sealEpoch(wEpoch);

		const res = new Promise((resolve, reject) => {
			timeout = setTimeout(reject, TIMEOUT_MS);
			const wcb = ethCallbackShim(
				bobContract,
				tokenProvider,
				"Withdrawn",
				({ address, tokens, epoch }) => {
					expect(address.equals(bobAddr)).to.be.true;
					expect(tokens.cmp(oAssets)).to.equal("eq");
					expect(epoch).to.equal(wEpoch);
					resolve(true);
				},
			);
			bobContract.once("Withdrawn", wcb);
		});

		const bal = new Balance(wEpoch, bobAddr, true, oAssets);
		// TODO: Fix this.
		// const bp = await bal.sign(conn.erdstall(), testenv.tee);
		const bp: any = undefined;
		const { stages, numStages } = await conn.withdraw("ethereum", bp);
		for await (const [name, stage] of stages) {
			const ctx = stage;
			const rec = await ctx.wait();
			expect(rec.status, "withdrawing should have worked").to.equal(0x1);
		}
		return res.finally(() => {
			clearTimeout(timeout);
		});
	});

	it("wraps tokentype registrations", async function () {
		let timeout: NodeJS.Timeout;
		const newTokenType = "2$IDEA";
		const newHolder = test.newRandomAddress(rng);
		const res = new Promise((resolve, reject) => {
			timeout = setTimeout(reject, TIMEOUT_MS);
			const wcb = ethCallbackShim(
				bobContract,
				unusedTokenProvider,
				"TokenTypeRegistered",
				({ tokenHolder, tokenType }) => {
					expect(tokenHolder.equals(newHolder)).to.be.true;
					expect(tokenType).to.equal(newTokenType);
					resolve(true);
				},
			);
			bobContract.once("TokenTypeRegistered", wcb);
		});
		const ctx = await opContract.registerTokenType(
			newHolder.toString(),
			newTokenType,
		);
		const rec = await ctx.wait();
		expect(rec.status, "registering token should have worked").to.equal(
			0x1,
		);
		return res.finally(() => {
			clearTimeout(timeout);
		});
	});

	it("wraps contract freeze", async function () {
		let timeout: NodeJS.Timeout;
		const wEpoch = (await testenv.currentEpoch()) - 2n;
		const res = new Promise((resolve, reject) => {
			timeout = setTimeout(reject, TIMEOUT_MS);
			const wcb = ethCallbackShim(
				bobContract,
				unusedTokenProvider,
				"Frozen",
				({ epoch }) => {
					expect(epoch).to.equal(wEpoch);
					resolve(true);
				},
			);
			bobContract.once("Frozen", wcb);
		});

		const bal = new Balance(wEpoch, bobAddr, false, oAssets);

		// TODO: Fix this.
		const bp: any = undefined;
		// const bp = await bal.sign(conn.erdstall(), testenv.tee);
		const [p, sig] = bp.toEthProof();
		let ctx = await bobContract.challenge(p, sig);
		let rec = await ctx.wait();
		expect(rec.status, "challenging should have worked").to.equal(0x1);

		await testenv.sealEpoch(wEpoch + 2n); // seal current epoch.

		ctx = await bobContract.ensureFrozen();
		rec = await ctx.wait();
		expect(rec.status, "freezing should have worked").to.equal(0x1);

		return res.finally(() => {
			clearTimeout(timeout);
		});
	});

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});
