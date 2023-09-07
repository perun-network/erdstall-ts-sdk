// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallSession, ErdstallClient, Client, Session } from "#erdstall";
import { expect } from "chai";
import {
	mkDefaultEthereumClientConstructor,
	mkDefaultEthereumSessionConstructor,
} from "./ledger/backend/ethereum";
import { mkDefaultSubstrateClientConstructor } from "./ledger/backend/substrate";
import { mkDefaultSubstrateSessionConstructor } from "./ledger/backend/substrate/session";

// TODO: Reintroduce

// describe("ErdstallClient", () => {
// 	const enclaveConn = new URL("http://localhost:8080");
// 	const cl: ErdstallClient<["ethereum", "substrate"]> = new Client<
// 		["ethereum", "substrate"]
// 	>(
// 		enclaveConn,
// 		mkDefaultEthereumClientConstructor({} as any),
// 		mkDefaultSubstrateClientConstructor(),
// 	);
//
// 	cl.on("Withdrawn", (e) => {});
// });
//
// describe("ErdstallSession", () => {
// 	const singleSession: ErdstallSession<["ethereum"]> = new Session<
// 		["ethereum"]
// 	>(
// 		{} as any,
// 		new URL("http://localhost:8080"),
// 		{} as any,
// 		mkDefaultEthereumSessionConstructor({} as any),
// 	);
//
// 	const _addr = singleSession.erdstall();
//
// 	const multiSession = new Session<["ethereum", "substrate"]>(
// 		{} as any,
// 		{} as any,
// 		{} as any,
// 		mkDefaultEthereumSessionConstructor({} as any),
// 		mkDefaultSubstrateSessionConstructor(),
// 	);
//
// 	const _multiAddr = multiSession.erdstall();
//
// 	singleSession.on("Withdrawn", (e) => {});
// });
