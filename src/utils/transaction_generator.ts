// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Backend } from "#erdstall/ledger/backend";
import { ethers } from "ethers";

export interface TransactionGenerator<B extends Backend> {
	stages: AsyncGenerator<[StageName<B>, StageTransaction<B>], void, void>;
	numStages: number;
}

type TransactionGenerators = {
	ethereum: ["approve" | "deposit" | "withdraw", ethers.ContractTransactionResponse];
	substrate: ["deposit" | "withdraw", Promise<void>];
	test: ["mock", string];
};

export type StageName<B extends Backend> = TransactionGenerators[B][0];

export type StageTransaction<B extends Backend> = TransactionGenerators[B][1];
