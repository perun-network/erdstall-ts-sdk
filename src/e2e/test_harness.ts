// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";
import { Trade } from "#erdstall/api/transactions";
import { Address } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import * as assets from "#erdstall/ledger/assets";
import { Session } from "#erdstall";
import * as test from "#erdstall/test";
import {
	PerunArt__factory,
	PerunToken__factory,
} from "#erdstall/ledger/backend/contracts";

import { ethers, utils } from "ethers";
import * as fs from "fs";
import { exec } from "child_process";
import {
	PERUN_ADDR,
	PART_ADDR,
	MNEMONIC,
	OP_PORT,
	OP_ENDPOINT,
	NODE_ENDPOINT,
	NODE_PORT,
} from "./parameters";
import { SDKActions } from "./sdk_actions";

export const ALICE = 0;
export const BOB = 1;
export const CHARLIE = 2;
export const DAGOBERT = 3;

export function endToEndTestHarness(sdkActions: SDKActions) {
	return () => {
		const rng = test.newPrng();
		const numOfEpochs = 30;
		const numOfAccs = 10;
		const fundingAmountETH = 1000;
		let erdstallProcessTerminate: Promise<void>;
		let teeAddress: Address;

		before(async function () {
			fs.writeFileSync(
				"operator.cfg",
				JSON.stringify({
					Mnemonic: MNEMONIC,
					OperatorDerivationPath: "m/44'/60'/0'/0/0",
					EnclaveDerivationPath: "m/44'/60'/0'/0/1",
					EpochDuration: 3,
					PowDepth: 0,
					RPCPort: OP_PORT,
					RPCHost: "0.0.0.0",
					NodeReqTimeout: 10,
					WaitMinedTimeout: 60,
					NFTokenBaseURI: "http://127.0.0.1:8440/metadata/",
				}),
			);

			return new Promise((accept, reject) => {
				const process = exec(
					[
						"$ERDSTALL_EXE",
						"-config operator.cfg",
						"-log-level trace",
						`-epochs ${numOfEpochs}`,
						`-ledger-port ${NODE_PORT}`,
						`-n ${numOfAccs}`,
						`-funds ${fundingAmountETH}`,
					].join(" "),
					(e) => {
						if (e) reject(e);
					},
				);

				erdstallProcessTerminate = new Promise<void>(
					(accept, reject) => {
						process.on("close", accept);
						process.on("error", reject);
					},
				);
				const timeout = setTimeout(accept, 30000);
				process.on("error", (e: Error) => {
					clearTimeout(timeout);
					reject(e);
				});
			});
		});
		after(async () => erdstallProcessTerminate);

		const sessions: Session[] = [];
		const forSessionsDo = async <R>(
			action: (client: Session) => Promise<R>,
			range: { from?: number; upto?: number } = {},
		) => {
			return Promise.all(
				sessions.slice(range.from, range.upto).map(action),
			);
		};

		before("create client sessions", async function () {
			for (let i = 0; i < 4; i++) {
				sessions[i] = await sdkActions.create(
					NODE_ENDPOINT,
					// We offset the accounts we retrieve from ganache by 3 so enclave,
					// operator and potentially the bot stay untouched.
					getGanacheSigner(i + 3),
					OP_ENDPOINT,
				);
			}

			sessions[ALICE].once(
				"config",
				(config) => (teeAddress = config.contract),
			);

			return Promise.all(sessions.map(sdkActions.initialize));
		});

		it("subscribe clients", async function () {
			forSessionsDo(sdkActions.subscribe);

			return new Promise((resolve, reject) => {
				const timeout = setTimeout(
					() =>
						reject(
							new Error(
								"subscribing should result in clients receiving phaseshift events",
							),
						),
					10000,
				);

				sessions[ALICE].once("phaseshift", () => {
					clearTimeout(timeout);
					resolve();
				});
			});
		});

		// All clients in this scenario start with 100 ETH,
		// `fundingAmountETH` PRN and 0 PART's.
		it("deposits", async function () {
			await forSessionsDo((c) =>
				sdkActions.deposit(
					c,
					utils.parseEther("10").toBigInt(),
					utils.parseEther("1000").toBigInt(),
				),
			);

			// Prevent race: wait for phase shift to finalize deposits.
			return new Promise((accept, reject) => {
				const timeout = setTimeout(
					() => reject(new Error("awaiting deposit finalization")),
					2000,
				);
				sessions[ALICE].once("phaseshift", () => {
					clearTimeout(timeout);
					accept();
				});
			});
		});

		it("off-chain tx + await receipt", async function () {
			sdkActions.offchainTransfer(
				sessions[ALICE],
				sessions[BOB],
				utils.parseEther("1").toBigInt(),
			);

			return new Promise((resolve, reject) => {
				let timeout = setTimeout(
					() => reject(new Error("Bob's receipt timed out")),
					15000,
				);

				sessions[BOB].once("receipt", () => {
					clearTimeout(timeout);
					resolve();
				});
			});
		});

		// Offchain:
		// | Balances | ETH | PRN  | PART |
		// |----------+-----+------+------|
		// | ALICE    | 10  | 999  | 0    |
		// | BOB      | 10  | 1001 | 0    |
		// | CHARLIE  | 10  | 1000 | 0    |
		// | DAGOBERT | 10  | 1000 | 0    |

		it("off-chain transactions benchmark", async function () {
			const txCount = 500;
			const begin = Date.now();
			for (let i = 0; i < txCount; i++) {
				const amount = new Assets({
					token: PERUN_ADDR,
					asset: new assets.Amount(utils.parseEther("1").toBigInt()),
				});
				await sessions[ALICE].transferTo(amount, sessions[BOB].address);
			}
			const timeMs = Date.now() - begin;
			console.log(
				`Sent ${txCount} TXs in ${timeMs / 1000}s (${
					timeMs / txCount
				}ms/tx | ${(1000 * txCount) / timeMs}Hz)`,
			);
		});

		// Offchain:
		// | Balances | ETH | PRN  | PART |
		// |----------+-----+------+------|
		// | ALICE    | 10  | 499  | 0    |
		// | BOB      | 10  | 1501 | 0    |
		// | CHARLIE  | 10  | 1000 | 0    |
		// | DAGOBERT | 10  | 1000 | 0    |

		it("leave", async function () {
			// Because of the quick succession in which we issue our commands, we
			// will sync with the next epoch to have a predictable outcome from here
			// on out.
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(
					() =>
						reject(
							new Error(
								"operator seems to have stopped execution",
							),
						),
					15000,
				);
				sessions[ALICE].once("phaseshift", () => {
					clearTimeout(timeout);
					resolve();
				});
			});

			return forSessionsDo(sdkActions.leave, {
				from: ALICE,
				upto: CHARLIE,
			});
		});

		// Withdrew offchain funds and brought back onchain.
		// Offchain:
		// | Balances | ETH | PRN  | PART |
		// |----------+-----+------+------|
		// | ALICE    | 0   | 0    | 0    |
		// | BOB      | 0   | 0    | 0    |
		// | CHARLIE  | 10  | 1000 | 0    |
		// | DAGOBERT | 10  | 1000 | 0    |

		const nfts: bigint[] = [];
		it("lets users mint tokens", async function () {
			return forSessionsDo(
				async (c) => {
					const nft = test.newRandomUint256(rng);
					nfts.push(nft);
					return sdkActions.mint(c, nft);
				},
				{ from: ALICE, upto: DAGOBERT },
			);
		});

		// Offchain:
		// | Balances | ETH | PRN  | PART |
		// |----------+-----+------+------|
		// | ALICE    | 0   | 0    | 1    |
		// | BOB      | 0   | 0    | 1    |
		// | CHARLIE  | 10  | 1000 | 1    |
		// | DAGOBERT | 10  | 1000 | 0    |

		it("lets users trade", async function () {
			const charlieNft = nfts[CHARLIE];
			const requestedPrn = utils.parseEther("10").toBigInt();

			sdkActions.trade(
				sessions[CHARLIE],
				sessions[DAGOBERT],
				charlieNft,
				requestedPrn,
			);

			return new Promise((resolve, reject) => {
				const timeout = setTimeout(
					() =>
						reject(
							new Error(
								`expected a trade receipt for clients[${CHARLIE}]`,
							),
						),
					15000,
				);

				sessions[CHARLIE].once("receipt", (tradeRec) => {
					expect(tradeRec.tx.txType()).to.equal(Trade);

					const tx = tradeRec.tx as Trade;
					expect(tx.sender.equals(sessions[DAGOBERT].address)).to.be
						.true;
					expect(tx.verify(teeAddress)).to.be.true;
					expect(tx.offer.owner.equals(sessions[CHARLIE].address)).to
						.be.true;
					expect(tx.offer.offer.hasAsset(PART_ADDR)).to.be.true;

					const expectedOffer = new Assets({
						token: PART_ADDR,
						asset: new assets.Tokens([charlieNft]),
					});
					const expectedRequest = new Assets({
						token: PERUN_ADDR,
						asset: new assets.Amount(requestedPrn),
					});
					expect(tx.offer.offer.cmp(expectedOffer)).to.equal("eq");
					expect(tx.offer.request.cmp(expectedRequest)).to.equal(
						"eq",
					);

					clearTimeout(timeout);
					resolve();
				});
			});
		});

		// Offchain:
		// | Balances | ETH | PRN  | PART |
		// |----------+-----+------+------|
		// | ALICE    | 0   | 0    | 1    |
		// | BOB      | 0   | 0    | 1    |
		// | CHARLIE  | 10  | 1010 | 0    |
		// | DAGOBERT | 10  | 990  | 1    |

		it("allows burning tokens", async function () {
			sdkActions.burn(sessions[DAGOBERT], nfts[CHARLIE]);

			return new Promise((resolve, reject) => {
				const timeout = setTimeout(
					() =>
						reject(
							new Error(
								`burning tokens should result in a receipt for clients[${DAGOBERT}]`,
							),
						),
					5000,
				);

				sessions[DAGOBERT].once("receipt", (rec) => {
					expect(
						rec.delta.has(sessions[DAGOBERT].address.key),
						`expected client[${DAGOBERT}] to be affected`,
					).to.be.true;
					expect(
						rec.delta
							.get(sessions[DAGOBERT].address.key)!
							.values.hasAsset(PART_ADDR),
						`expected asset to be burnt`,
					).to.be.false;

					clearTimeout(timeout);
					resolve();
				});
			});
		});

		// Offchain:
		// | Balances | ETH | PRN  | PART |
		// |----------+-----+------+------|
		// | ALICE    | 0   | 0    | 1    |
		// | BOB      | 0   | 0    | 1    |
		// | CHARLIE  | 10  | 1010 | 0    |
		// | DAGOBERT | 10  | 990  | 0    |

		const expectedBalances = [
			{
				eth: "99.5",
				prn: "499.0",
				part: "1",
			},
			{
				eth: "99.5",
				prn: "1501.0",
				part: "1",
			},
			{
				eth: "99.5",
				prn: "1010.0",
				part: "0",
			},
			{
				eth: "99.5",
				prn: "990.0",
				part: "0",
			},
		];

		it("withdrawing results in clients holding tokens on-chain", async function () {
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(
					() =>
						reject(
							new Error(
								"operator seems to have stopped execution",
							),
						),
					15000,
				);
				sessions[ALICE].once("phaseshift", () => {
					clearTimeout(timeout);
					resolve();
				});
			});

			await forSessionsDo((c) =>
				sdkActions.leavingAndSeeFundsOnchain(c, makeProvider()),
			);

			const res = await forSessionsDo((c) =>
				listOnchainBalances(c.address),
			);
			assertBalances(res, expectedBalances);
		});

		// Final ONCHAIN balances:
		// | Balances | ETH    | PRN  | PART |
		// |----------+--------+------+------|
		// | ALICE    | 99<100 | 499  | 1    |
		// | BOB      | 99<100 | 1501 | 1    |
		// | CHARLIE  | 99<100 | 1010 | 0    |
		// | DAGOBERT | 99<100 | 990  | 0    |
	};
}

function makeProvider(): ethers.providers.JsonRpcProvider {
	return new ethers.providers.JsonRpcProvider(NODE_ENDPOINT);
}

function getGanacheSigner(index: number): ethers.Signer {
	const provider = makeProvider();
	return provider.getSigner(index);
}

// We use `string`s here because it is easier to test with `chai` in the next
// steps.
type balances = {
	eth: string;
	prn: string;
	part: string;
};

async function listOnchainBalances(address: Address): Promise<balances> {
	const provider = makeProvider();

	const eth = await provider.getBalance(address.toString());
	const prn = await PerunToken__factory.connect(
		PERUN_ADDR.toString(),
		provider,
	).balanceOf(address.toString());
	const part = await PerunArt__factory.connect(
		PART_ADDR.toString(),
		provider,
	).balanceOf(address.toString());

	return {
		eth: utils.formatEther(eth),
		prn: utils.formatEther(prn),
		part: part.toString(),
	};
}

function assertBalances(given: balances[], expected: balances[]) {
	for (let client = 0; client <= DAGOBERT; client++) {
		expect(Number(given[client].eth)).within(
			Number(expected[client].eth) - 0.5,
			Number(expected[client].eth) + 0.5,
		);
		expect(given[client].prn).to.equal(expected[client].prn);
		expect(given[client].part).to.equal(expected[client].part);
	}
}
