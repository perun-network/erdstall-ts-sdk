// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";

import { Wallet, utils } from "ethers";
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
	const o_assets = new Assets();
	let bobContract: Erdstall;
	let opContract: Erdstall;
	let conn: LedgerWriter;
	let tokenProvider: Pick<TokenProvider, "tokenTypeOf">;
	let deposits: [string, Asset][] = [];

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
		deposits.forEach(([token, value]) => o_assets.addAsset(token, value));

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

	it("wraps challenges", function (done) {
		const w_epoch = 4n;
		const wcb = ethCallbackShim(
			bobContract,
			unusedTokenProvider(),
			"Challenged",
			({ address, epoch }) => {
				expect(address.equals(bobAddr)).to.be.true;
				// We challenged with proof for `epoch n` and are currently in `epoch
				// n+1`, which results in the challenge epoch to be offset by one.
				expect(epoch).to.equal(w_epoch + 1n);
				done();
			},
		);
		bobContract.once("Challenged", wcb);

		const bal = new Balance(w_epoch, bobAddr, false, o_assets);
		bal.sign(conn.erdstall(), testenv.tee).then((bp) => {
			const [p, sig] = bp.toEthProof();
			bobContract.challenge(p, sig);
		});
	});

	// mocha does not allow to use `async function (done)` together, so we can
	// either use manual timeouts or enter slight callback hell.
	it("wraps challenge responses", function (done) {
		let o_sig: Signature;
		const w_epoch = 5n;
		// Wait an epoch before responding to challenge.
		sealEpoch(bob).then(() => {
			const wcb = ethCallbackShim(
				bobContract,
				tokenProvider,
				"ChallengeResponded",
				({ address, epoch, tokens, sig }) => {
					expect(address.equals(bobAddr)).to.be.true;
					expect(epoch).to.equal(w_epoch);
					expect(tokens.cmp(o_assets)).to.equal("eq");
					expect(sig.toString()).to.equal(o_sig.toString());
					done();
				},
			);
			bobContract.once("ChallengeResponded", wcb);
			const bal = new Balance(w_epoch, bobAddr, true, o_assets);
			bal.sign(conn.erdstall(), testenv.tee).then((bp) => {
				const [p, s] = bp.toEthProof();
				o_sig = new Signature(utils.arrayify(s));
				opContract.respondChallenge(p, s);
			});
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
					expect(assets.cmp(o_assets)).to.equal("lt");

					numOfEvents++;
					if (numOfEvents === expectedNumOfEvents) resolve(true);
				},
			);
			bobContract.on("Deposited", wcb);
		});

		const stages = await conn.deposit(o_assets);
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

	it("wraps withdrawals", function (done) {
		const w_epoch = 5n;
		const wcb = ethCallbackShim(
			bobContract,
			tokenProvider,
			"Withdrawn",
			({ address, tokens, epoch }) => {
				expect(address.equals(bobAddr)).to.be.true;
				expect(tokens.cmp(o_assets)).to.equal("eq");
				expect(epoch).to.equal(w_epoch);
				done();
			},
		);
		bobContract.once("Withdrawn", wcb);
		const bal = new Balance(w_epoch, bobAddr, true, o_assets);
		bal.sign(conn.erdstall(), testenv.tee).then(async (bp) => {
			const stages = await conn.withdraw(bp);
			for (const stage of stages) {
				const ctx = await stage.value;
				const rec = await ctx.wait();
				expect(rec.status, "withdrawing should have worked").to.equal(
					0x1,
				);
			}
		});
	});

	it("wraps token registrations", function (done) {
		const newToken = test.newRandomAddress(rng);
		const wcb = ethCallbackShim(
			bobContract,
			unusedTokenProvider(),
			"TokenRegistered",
			({ token, tokenHolder, tokenType }) => {
				expect(token.equals(newToken)).to.be.true;
				expect(
					tokenHolder.equals(Address.fromString(testenv.erc20Holder)),
				).to.be.true;
				expect(tokenType).to.equal("ERC20");
				done();
			},
		);
		bobContract.once("TokenRegistered", wcb);
		opContract.registerToken(newToken.toString(), testenv.erc20Holder);
	});

	it("wraps tokentype registrations", function (done) {
		const newTokenType = "2$IDEA";
		const newHolder = test.newRandomAddress(rng);
		const wcb = ethCallbackShim(
			bobContract,
			unusedTokenProvider(),
			"TokenTypeRegistered",
			({ tokenHolder, tokenType }) => {
				expect(tokenHolder.equals(newHolder)).to.be.true;
				expect(tokenType).to.equal(newTokenType);
				done();
			},
		);
		bobContract.once("TokenTypeRegistered", wcb);
		opContract.registerTokenType(newHolder.toString(), newTokenType);
	});

	it("wraps contract freeze", function (done) {
		const w_epoch = 9n; // <- Current epoch, found by trial and error...
		const wcb = ethCallbackShim(
			bobContract,
			unusedTokenProvider(),
			"Frozen",
			({ epoch }) => {
				expect(epoch).to.equal(w_epoch);
				done();
			},
		);
		bobContract.once("Frozen", wcb);

		const bal = new Balance(w_epoch, bobAddr, false, o_assets);
		// We use callbacks here because it is easier on the eyes, than the
		// alternative.
		bal.sign(conn.erdstall(), testenv.tee).then((bp) => {
			const [p, sig] = bp.toEthProof();
			bobContract.challenge(p, sig).then(async () => {
				await sealEpoch(bob); // seal current epoch.
				await sealEpoch(bob); // seal epoch in which op can respond.
				bobContract.ensureFrozen();
			});
		});
	});
});

function unusedTokenProvider(): Pick<TokenProvider, "tokenTypeOf"> {
	return {
		tokenTypeOf: async (
			_erdstall: Erdstall,
			_token: string,
		): Promise<TokenType> => {
			throw new Error(
				"unexpected use of tokenProvider in callback implementation",
			);
		},
	};
}

async function sealEpoch(w: Wallet, n = 1) {
	for (let i = 0; i < EPOCH_DURATION * n; i++) {
		await w.sendTransaction({ to: w.address, value: 0n });
	}
}
