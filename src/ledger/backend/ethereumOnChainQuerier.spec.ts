"use strict";

import { expect } from "chai";
import { EthereumOnChainQuerier } from "./ethereumOnChainQuerier";
import { OnChainQuerier } from "../onChainQuerier";

import * as test from "#erdstall/test";
import { Environment, setupEnv } from "test/ledger";
import { Wallet } from "@ethersproject/wallet";
import { IERC721Minter__factory, IERC721__factory } from ".";
import { Tokens } from "../assets";
import PRNG from "#erdstall/test/random";
import { afterEach } from "mocha";

const PRIMES = [2, 3, 5, 7];
const TOKEN_SIZE = PRIMES.length;
const RNG: PRNG = test.newPrng();

interface Entity {
	wallet: Wallet;
	tokens: Tokens;
	runningTokens: bigint[];
}

describe("EthereumOnChainQuerier", function () {
	let testenv: Environment;
	let alice: Entity;
	let bob: Entity;
	let onChainQueryA: OnChainQuerier;
	let aTransferSeed: number;
	let bTransferSeed: number;

	const initEntity = async (wallet: Wallet): Promise<Entity> => {
		const tokens = test.newRandomTokens(RNG, TOKEN_SIZE);
		const entity: Entity = {
			wallet,
			tokens,
			runningTokens: Array.from(tokens.value),
		};

		const erc721Minter = IERC721Minter__factory.connect(
			testenv.perunArt,
			entity.wallet,
		);
		let nonce = await entity.wallet.provider.getTransactionCount(
			entity.wallet.address,
		);
		for (const id of entity.tokens.value) {
			await erc721Minter.mint(entity.wallet.address, id, {
				nonce: nonce++,
			});
		}
		await testenv.mine();

		return entity;
	};

	const seededTokenTransfer = async (
		from: Entity,
		to: Entity,
		seed: number,
		tokenPool: Tokens,
		mineEachTX: boolean,
	): Promise<void> => {
		const ierc721 = IERC721__factory.connect(testenv.perunArt, from.wallet);
		let nonce = await from.wallet.provider.getTransactionCount(
			from.wallet.address,
		);
		for (let index = 0; index < TOKEN_SIZE; ++index) {
			if ((seed % PRIMES[index]) % 2 === 0) {
				const token = tokenPool.value[index];
				await ierc721.transferFrom(
					from.wallet.address,
					to.wallet.address,
					token,
					{ nonce: nonce++ },
				);
				to.runningTokens.push(token);
				from.runningTokens.splice(from.runningTokens.indexOf(token), 1);
				if (mineEachTX) {
					await testenv.mine();
				}
			}
		}
		await testenv.mine();
	};

	before(async function () {
		testenv = await setupEnv(2, undefined, { blockTime: 1 });
		alice = await initEntity(testenv.users[0]);
		bob = await initEntity(testenv.users[1]);
		onChainQueryA = new EthereumOnChainQuerier(alice.wallet);
	});

	const transferTest = async (mineEachTX: boolean): Promise<void> => {
		aTransferSeed = RNG.uInt32();
		await seededTokenTransfer(
			alice,
			bob,
			aTransferSeed,
			alice.tokens,
			mineEachTX,
		);
		bTransferSeed = RNG.uInt32();
		await seededTokenTransfer(
			bob,
			alice,
			bTransferSeed,
			bob.tokens,
			mineEachTX,
		);

		let aliceTokens = await onChainQueryA.queryTokensOwnedByAddress(
			testenv.perunArt,
			alice.wallet.address,
		);
		expect(aliceTokens.value)
			.to.have.members(alice.runningTokens)
			.and.length(alice.runningTokens.length);
		let bobTokens = await onChainQueryA.queryTokensOwnedByAddress(
			testenv.perunArt,
			bob.wallet.address,
		);
		expect(bobTokens.value)
			.to.have.members(bob.runningTokens)
			.and.length(bob.runningTokens.length);
	};

	it("correctly returns the tokens in the address' possession after transfers across blocks", async function () {
		return transferTest(true);
	});

	it("correctly returns the tokens in the address' possession after single-block transfers", async function () {
		return transferTest(false);
	});

	afterEach(async function () {
		// send the tokens back
		await seededTokenTransfer(alice, bob, bTransferSeed, bob.tokens, true);
		await seededTokenTransfer(
			bob,
			alice,
			aTransferSeed,
			alice.tokens,
			false,
		);
	});
});
