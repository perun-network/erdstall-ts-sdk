// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ClientConfig, BalanceProof, TxReceipt } from "../src/api/responses";
import { Mint } from "../src/api/transactions";
import { Address, Assets } from "../src/ledger";
import * as sdk from "../src";
import setup, { Enviroment } from "../src/ledger/backend/enviroment.spec";

describe("Erdstall-TS-SDK", () => {
	const opAddr = new URL("thisIsNotAValidURL");
	let env: Enviroment;
	before(async () => {
		env = await setup();
	});

	it("exposes a client to interface with Erdstall", async () => {
		const BOB = env.users[0];
		const bobAddress = Address.fromString(env.users[0].address);
		const aliceAddress = Address.fromString(env.users[1].address);

		const client = sdk.NewClient(bobAddress, BOB, opAddr);

		client.on("Frozen", () => console.log("ups contract frozen"));
		client.on("Deposited", () => console.log("deposit occurred"));
		client.on("Challenged", () => console.log("some challenge happened"));
		client.on("ChallengeResponded", () => console.log("some response"));
		client.on("TokenRegistered", () => console.log("token registered"));
		client.on("TokenTypeRegistered", () => console.log("type registered"));

		client.on("open", () => onEnclaveOpen);
		client.on("close", () => onEnclaveClose);
		client.on("error", () => onEnclaveError);
		client.on("config", () => onEnclaveConfig);
		client.on("exitproof", () => onEnclaveExitProof);
		client.on("proof", () => onEnclaveProof);
		client.on("receipt", () => onEnclaveTxReceipt);

		// establishes connection to erdstall-contract on ledger and connection to
		// enclave with the given url. All event handlers were registered and
		// forwarded were necessary.
		client.initialise();

		let contractTXs = await client.deposit(new Assets());
		for (const ctx of contractTXs) {
			console.log(`waiting for confirmation of tx with hash ${ctx.hash}`);
			await ctx.wait();
		}
		console.log("deposit successful.");

		let rec = await client.transferTo(new Assets(), aliceAddress);
		console.log(`transferred given assets to ${aliceAddress}`);
		console.log("look at my nice receipt: ", rec);

		rec = await client.mint(bobAddress, bobAddress, 420691337n);
		console.log(
			`minted my desired token ${(rec.tx as Mint).token.toString()}`,
		);

		// I am satisfied, lets leave the system.
		contractTXs = await client.leave();
		for (const ctx of contractTXs) {
			console.log(`waiting for confirmation of tx with hash ${ctx.hash}`);
			await ctx.wait();
		}

		client.off("Frozen", () => console.log("ups contract frozen"));
		client.off("Deposited", () => console.log("deposit occurred"));
		client.off("Challenged", () => console.log("some challenge happened"));
		client.off("ChallengeResponded", () => console.log("some response"));
		client.off("TokenRegistered", () => console.log("token registered"));
		client.off("TokenTypeRegistered", () => console.log("type registered"));

		client.off("open", () => onEnclaveOpen);
		client.off("close", () => onEnclaveClose);
		client.off("error", () => onEnclaveError);
		client.off("config", () => onEnclaveConfig);
		client.off("exitproof", () => onEnclaveExitProof);
		client.off("proof", () => onEnclaveProof);
		client.off("receipt", () => onEnclaveTxReceipt);
	});
});

function onEnclaveError(ev: string | Event) {
	console.log("some error from enclave with content: ", ev);
}

function onEnclaveOpen() {
	console.log("connection to enclave established");
}

function onEnclaveClose() {
	console.log("connection to enclave closed");
}

function onEnclaveConfig(cfg: ClientConfig) {
	console.log("received client config: ", cfg);
}

function onEnclaveExitProof(exitProof: BalanceProof) {
	console.log("received exitProof: ", exitProof);
}

function onEnclaveProof(proof: BalanceProof) {
	console.log("received balanceProof: ", proof);
}

function onEnclaveTxReceipt(rec: TxReceipt) {
	console.log("received txReceipt: ", rec);
}
