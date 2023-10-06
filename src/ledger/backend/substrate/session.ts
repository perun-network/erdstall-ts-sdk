// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ChainProofChunk, ClientConfig } from "#erdstall/api/responses";
import { ErdstallBackendSession } from "#erdstall/erdstall";
import { Assets, ChainAssets } from "#erdstall/ledger/assets";
import { TransactionGenerator } from "#erdstall/utils";
import { SubstrateClient } from "./client";

export class SubstrateSession
	extends SubstrateClient
	implements ErdstallBackendSession<"substrate">
{
	deposit<B extends "substrate">(
		backend: B,
		assets: ChainAssets,
	): Promise<TransactionGenerator<B>> {
		throw new Error("Method not implemented.");
	}
	withdraw<B extends "substrate">(
		backend: B,
		exitProof: ChainProofChunk[],
	): Promise<TransactionGenerator<B>> {
		throw new Error("Method not implemented.");
	}
}

export function mkDefaultSubstrateSessionConstructor(): {
	backend: "substrate";
	arg: number;
	initializer: (c: ClientConfig) => SubstrateSession;
} {
	const arg = 420;
	return {
		backend: "substrate",
		arg: arg,
		initializer: (_c: ClientConfig) => new SubstrateSession(arg),
	};
}
