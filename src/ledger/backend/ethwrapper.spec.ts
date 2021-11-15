// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";

import { Wallet } from "ethers";
import { PerunArt__factory } from "./contracts";
import { Address } from "#erdstall/ledger";
import {
	ETHZERO,
	Asset,
	Assets,
	Amount,
	TokenType,
} from "#erdstall/ledger/assets";
import { Balance } from "#erdstall/api/responses";
import { Signature } from "#erdstall/api";

import { Erdstall__factory, Erdstall } from "./contracts";
import { LedgerWriteConn, LedgerWriter } from "./writeconn";
import { TokenFetcher, TokenProvider } from "./tokencache";
import { Environment, setupEnv } from "#erdstall/test/ledger";
import { ethCallbackShim, Listener } from "./ethwrapper";

import * as test from "#erdstall/test";

const TOKEN_SIZE = 4;
const TIMEOUT_MS = 15000;
const EPOCH_DURATION = 3;

describe("ErdstallEventWrapping", function () {
	const rng = test.newPrng();
	let testenv: Environment;
	let bob: Wallet;
	let bobAddr: Address;
	const amount = new Amount(10n);
	const tokens = test.newRandomTokens(rng, TOKEN_SIZE);
	const oAssets = new Assets();
	let bobContract: Erdstall;
	let opContract: Erdstall;
	let conn: LedgerWriter;
	let tokenProvider: Pick<TokenProvider, "tokenTypeOf">;
	let deposits: [string, Asset][] = [];
	const unusedTokenProvider: Pick<TokenProvider, "tokenTypeOf"> = {
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
		bobAddr = Address.fromString(bob.address);

		const part = PerunArt__factory.connect(testenv.perunArt, bob);
		for (const id of tokens.value) {
			await part.mint(bob.address, id);
		}

		deposits = [
			[testenv.perun, amount],
			[ETHZERO, amount],
			[testenv.perunArt, tokens],
		];
		deposits.forEach(([token, value]) => oAssets.addAsset(token, value));

		opContract = Erdstall__factory.connect(testenv.erdstall, testenv.op);
		bobContract = Erdstall__factory.connect(testenv.erdstall, bob);
		conn = new LedgerWriteConn(bobContract, new TokenFetcher());
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
					case testenv.perunArt:
						return "ERC721Mintable";
					default:
						throw new Error("unknown tokentype");
				}
			},
		};
	});

	let challengedEpoch = 0n;
	it("wraps challenges", async function () {
		let timeout: NodeJS.Timeout;
		challengedEpoch = (await testenv.currentEpoch()) - 2n;

		const res = new Promise((resolve, reject) => {
			timeout = setTimeout(reject, TIMEOUT_MS);
			const wcb = ethCallbackShim(
				bobContract,
				unusedTokenProvider,
				"Challenged",
				({ address, epoch }) => {
					expect(address.equals(bobAddr)).to.be.true;
					// We challenged with proof for `epoch n` and are currently in `epoch
					// n+1`, which results in the challenge epoch to be offset by one.
					expect(epoch).to.equal(challengedEpoch + 1n);
					resolve(true);
				},
			);
			bobContract.once("Challenged", wcb);
		});

		const bal = new Balance(challengedEpoch, bobAddr, false, oAssets);
		const bp = await bal.sign(conn.erdstall(), testenv.tee);
		const [p, sig] = bp.toEthProof();
		const ctx = await bobContract.challenge(p, sig);
		const rec = await ctx.wait();
		expect(rec.status, "challenging should have worked").to.equal(0x1);

		return res.finally(() => {
			clearTimeout(timeout);
		});
	});

	it("wraps challenge responses", async function () {
		let timeout: NodeJS.Timeout;
		let oSig: Signature;
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
		bal.sign(conn.erdstall(), testenv.tee).then((bp) => {
			const [p, s] = bp.toEthProof();
			oSig = new Signature(s);
			opContract.respondChallenge(p, s);
		});
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

		const stages = await conn.deposit(oAssets);
		for (const stage of stages) {
			const ctx = await stage.value;
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
		const bp = await bal.sign(conn.erdstall(), testenv.tee);
		const stages = await conn.withdraw(bp);
		for (const stage of stages) {
			const ctx = await stage.value;
			const rec = await ctx.wait();
			expect(rec.status, "withdrawing should have worked").to.equal(0x1);
		}
		return res.finally(() => {
			clearTimeout(timeout);
		});
	});

	it("wraps token registrations", async function () {
		let timeout: NodeJS.Timeout;
		const newToken = test.newRandomAddress(rng);

		const res = new Promise((resolve, reject) => {
			timeout = setTimeout(reject, TIMEOUT_MS);
			const wcb = ethCallbackShim(
				bobContract,
				unusedTokenProvider,
				"TokenRegistered",
				({ token, tokenHolder, tokenType }) => {
					expect(token.equals(newToken)).to.be.true;
					expect(
						tokenHolder.equals(
							Address.fromString(testenv.erc20Holder),
						),
					).to.be.true;
					expect(tokenType).to.equal("ERC20");
					resolve(true);
				},
			);
			bobContract.once("TokenRegistered", wcb);
		});
		const ctx = await opContract.registerToken(
			newToken.toString(),
			testenv.erc20Holder,
		);
		const rec = await ctx.wait();
		expect(rec.status, "registering token should have worked").to.equal(
			0x1,
		);
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
		const bp = await bal.sign(conn.erdstall(), testenv.tee);
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
});
