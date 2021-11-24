// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import * as assets from "#erdstall/ledger/assets";
import { Session } from "#erdstall";

import { ethers } from "ethers";
import * as fs from "fs";
import { exec } from "child_process";

describe("Erdstall-TS-SDK", () => {
	const opPort = 1433;
	const opAddr = new URL(`ws://127.0.0.1:${opPort}/ws`);
	const nodePort = 1362;
	const mnemonic =
		"pistol kiwi shrug future ozone ostrich match remove crucial oblige cream critic";
	let erdstallProcessTerminate: Promise<void>;

	before(async () => {
		fs.writeFileSync(
			"operator.cfg",
			JSON.stringify({
				Mnemonic: mnemonic,
				OperatorDerivationPath: "m/44'/60'/0'/0/0",
				EnclaveDerivationPath: "m/44'/60'/0'/0/1",
				EpochDuration: 2,
				ResponseDuration: 3,
				PowDepth: 0,
				RPCPort: opPort,
				RPCHost: "0.0.0.0",
				NodeReqTimeout: 10,
				WaitMinedTimeout: 60,
			}),
		);

		return new Promise((accept, reject) => {
			const process = exec(
				[
					"$ERDSTALL_EXE",
					"-config operator.cfg",
					"-epochs 10",
					`-ledger-port ${nodePort}`,
				].join(" "),
				(e) => {
					if (e) reject(e);
				},
			);

			erdstallProcessTerminate = new Promise<void>((accept, reject) => {
				process.on("close", accept);
				process.on("error", reject);
			});
			const timeout = setTimeout(accept, 10000);
			process.on("error", (e: Error) => {
				clearTimeout(timeout);
				reject(e);
			});
		});
	});
	after(async () => erdstallProcessTerminate);

	function makeClient(index: number): Session {
		const provider = new ethers.providers.JsonRpcProvider(
			`http://localhost:${nodePort}`,
		);
		const derivationPath = `m/44'/60'/0'/0/${index + 2}`;
		const user = ethers.Wallet.fromMnemonic(mnemonic, derivationPath);
		const userAddr = Address.fromString(user.address);
		return new Session(userAddr, user.connect(provider), opAddr);
	}

	const clients: Session[] = [];

	it("create clients", async () => {
		for (let i = 0; i < 4; i++) clients.push(makeClient(i));

		// establishes connection to erdstall-contract on ledger and connection
		// to enclave with the given url. All event handlers were registered and
		// forwarded were necessary.
		return Promise.all(clients.map((x) => x.initialize()));
	});
	it("subscribe clients", async () =>
		Promise.all(clients.map((c) => c.subscribeSelf())));

	it("deposits", async () => {
		const depositBal = new Assets({
			token: assets.ETHZERO,
			asset: new assets.Amount(100000000n),
		});

		const transactionGenerators = await Promise.all(
			clients.map((c) => c.deposit(depositBal)),
		);

		await Promise.all(
			transactionGenerators.map(async ({ stages }) => {
				for await (const [, stage] of stages) {
					await stage.wait();
				}
			}),
		);

		// Prevent race: wait for phase shift to finalize deposits.
		return new Promise((accept, reject) => {
			const timeout = setTimeout(
				() => reject(new Error("awaiting deposit finalization")),
				2000,
			);
			clients[0].once("phaseshift", () => {
				clearTimeout(timeout);
				accept();
			});
		});
	});

	it("off-chain tx + await receipt", async () => {
		const amount = new Assets();
		amount.addAsset(assets.ETHZERO, new assets.Amount(100n));
		await clients[0].transferTo(amount, clients[1].address);
		return new Promise((resolve, reject) => {
			let timeout = setTimeout(
				() => reject(new Error("Bob's receipt timed out")),
				15000,
			);
			clients[1].once("receipt", () => {
				clearTimeout(timeout);
				resolve();
			});
		});
	});

	it("off-chain transactions", async () => {
		const txCount = 500;
		const begin = Date.now();
		const responses = [];
		for (let i = 0; i < txCount; i++) {
			const amount = new Assets();
			amount.addAsset(assets.ETHZERO, new assets.Amount(BigInt(i)));
			responses.push(clients[0].transferTo(amount, clients[1].address));
		}
		await Promise.all(responses);
		const timeMs = Date.now() - begin;
		console.log(
			`Sent ${txCount} TXs in ${timeMs / 1000}s (${
				timeMs / txCount
			}ms/tx | ${(1000 * txCount) / timeMs}Hz)`,
		);
	});

	it("leave", async () => {
		const transactionGenerators = await Promise.all(
			clients.slice(0, 2).map((c) => c.leave()),
		);
		return Promise.all(
			transactionGenerators.map(async ({ stages }) => {
				for await (const [, stage] of stages) {
					stage.wait();
				}
			}),
		);
	});

	let nft: bigint;
	it("lets users mint tokens", async () => {
		nft = 89430923n;
		return clients[2].mint(clients[2].address, nft);
	});

	it("lets users trade", async () => {
		// Charlie trades his NFT for Dagobert's ETH.
		const offer = new Assets({
			token: clients[2].address,
			asset: new assets.Tokens([nft]),
		});
		const expect = new Assets({
			token: assets.ETHZERO,
			asset: new assets.Amount(1000n),
		});

		const tradeOffer = await clients[2].createOffer(offer, expect);
		return clients[3].acceptTrade(tradeOffer);
	});

	it("allows burning tokens", async () => {
		const token = clients[2].address;
		const rec = await clients[3].burn(
			new Assets({
				token,
				asset: new assets.Tokens([nft]),
			}),
		);
		if (!rec.delta.has(clients[3].address.key))
			throw new Error("expected client[3] to be affected");
		if (rec.delta.get(clients[3].address.key)!.values.hasAsset(token))
			throw new Error("expected asset to be burnt");
	});
});
