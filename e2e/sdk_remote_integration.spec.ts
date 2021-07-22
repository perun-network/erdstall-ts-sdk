// SPDX-License-Identifier: Apache-2.0
"use strict";

import { TxReceipt } from "../src/api/responses";
import { Mint } from "../src/api/transactions";
import { Address, Assets, assets } from "../src/ledger";
import * as sdk from "../src";
import { Erdstall } from "../src";

import { ethers } from "ethers";
import * as fs from "fs";
import { exec } from "child_process";

(global as any).WebSocket = require("ws");

describe("Erdstall-TS-SDK", () => {
	const opPort = 1433;
	const opAddr = new URL(`ws://127.0.0.1:${opPort}/ws`);
	const nodePort = 1362;
	const mnemonic = "pistol kiwi shrug future ozone ostrich match remove crucial oblige cream critic";

	before(async () => {
		await new Promise(accept => fs.writeFile("operator.cfg", JSON.stringify({
			Mnemonic: mnemonic,
			OperatorDerivationPath: "m/44'/60'/0'/0/0",
			EnclaveDerivationPath:  "m/44'/60'/0'/0/1",
			EpochDuration: 10,
			ResponseDuration: 3,
			PowDepth: 0,
			RPCPort: opPort,
			RPCHost: "0.0.0.0",
			NodeReqTimeout: 10,
			WaitMinedTimeout: 60
		}), accept));

		exec(`$ERDSTALL_EXE -config operator.cfg -epochs 15 -ledger-port ${nodePort} 2> out2.txt > out.txt &`);
		await new Promise(accept => setTimeout(accept, 10000));
	});

	function makeClient(index: number): Erdstall {
		const provider = new ethers.providers.JsonRpcProvider(`http://localhost:${nodePort}`);
		const derivationPath = `m/44'/60'/0'/0/${index+2}`;
		const user = ethers.Wallet.fromMnemonic(mnemonic, derivationPath);
		const userAddr = Address.fromString(user.address);
		return sdk.NewClient(userAddr, user.connect(provider), opAddr);
	}

	let alice: Erdstall | null = null;
	let bob: Erdstall | null = null;
	let charlie: Erdstall | null = null;
	let dagobert: Erdstall | null = null;
	let charlieNft: bigint | null = null;

	it("create clients", async() => {
		alice = makeClient(0);
		bob = makeClient(1);
		charlie = makeClient(2);
		dagobert = makeClient(3);
		
		// establishes connection to erdstall-contract on ledger and connection
		// to enclave with the given url. All event handlers were registered and
		// forwarded were necessary.
		await Promise.all([alice, bob, charlie, dagobert].map(x => x.initialize()));
	});
	it("subscribe clients", async() => await Promise.all([
		alice!.subscribe(),
		bob!.subscribe(),
	]));

	it("deposits", async() => {
		const depositBal = new Assets();
		depositBal.addAsset(assets.ETHZERO, new assets.Amount(100000000n));

		const cs = [alice, bob, charlie, dagobert];
		const stages = await Promise.all(cs.map(c => c!.deposit(depositBal)));
		await Promise.all(stages.map(stage => stage.wait()));
	});

	it("off-chain tx + await receipt", async () => {
		const amount = new Assets();
		amount.addAsset(assets.ETHZERO, new assets.Amount(100n));
		await alice!.transferTo(amount, bob!.address);
		let bobReceipt = new Promise((resolve, reject) => {
			let timeout = setTimeout(() => reject(new Error("Bob's receipt timed out")), 15000);
			bob!.once("receipt", (receipt: TxReceipt) => {
				clearTimeout(timeout);
				resolve(receipt);
			});
		});
		await bobReceipt;
	});

	it("off-chain transactions", async () => {
		const txCount = 500;
		const begin = Date.now();
		let responses = [];
		for(let i = 0; i < txCount; i++) {
			const amount = new Assets();
			amount.addAsset(assets.ETHZERO, new assets.Amount(BigInt(i)));
			responses.push(alice!.transferTo(amount, bob!.address));
		}
		await Promise.all(responses);
		const timeMs = (Date.now() - begin);
		console.log(`Sent ${txCount} TXs in ${timeMs / 1000}s (${timeMs / txCount}ms/tx | ${1000 * txCount / timeMs}Hz)`);
	});

	it("leave", async() => {
		// I am satisfied, let's leave the system.
		let [aliceLeave, bobLeave] = [alice!.leave(), bob!.leave()];
		await (await aliceLeave).wait();
		await (await bobLeave).wait();
	});

	it("lets users mint tokens", async() => {
		charlieNft = 89430923n;
		await charlie!.mint(charlie!.address, charlieNft!);
	});

	it("lets users trade", async () => {
		// Charlie trades his NFT for Dagobert's ETH.
		const offer = new Assets();
		offer.addAsset(charlie!.address, new assets.Tokens([charlieNft!]));
		const expect = new Assets();
		expect.addAsset(assets.ETHZERO, new assets.Amount(1000n));

		const tradeOffer = await charlie!.createOffer(offer, expect);
		await dagobert!.acceptTrade(tradeOffer);
	});
});