// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallSession, ErdstallClient, Client, Session } from "#erdstall";
import { expect } from "chai";

describe("ErdstallClient", () => {
	const enclaveConn = new URL("http://localhost:8080");
	const cl: ErdstallClient<["ethereum", "substrate"]> = new Client<
		["ethereum", "substrate"]
	>(
		enclaveConn,
		{
			backend: "ethereum",
			encConn: enclaveConn,
			provider: {} as any,
		},
		{
			backend: "substrate",
			arg: 420,
		},
	);

	cl.on("Withdrawn", (e) => {});
});

describe("ErdstallSession", () => {
	const singleSession: ErdstallSession<["ethereum"]> = new Session<
		["ethereum"]
	>({
		backend: "ethereum",
		encConn: new URL("http://localhost:8545"),
		provider: {} as any,
		signer: {} as any,
		address: {} as any,
	});

	const _addr = singleSession.erdstall();

	const multiSession = new Session<["ethereum", "substrate"]>(
		{
			backend: "ethereum",
			encConn: new URL("http://localhost:8545"),
			provider: {} as any,
			signer: {} as any,
			address: {} as any,
		},
		{
			backend: "substrate",
			arg: 420,
		},
	);

	const _multiAddr = multiSession.erdstall();

	singleSession.on("Withdrawn", (e) => {});
});
