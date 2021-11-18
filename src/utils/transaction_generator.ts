// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";

export type TransactionName = "approve" | "deposit" | "withdraw";

export interface TransactionGenerator {
	stages: AsyncGenerator<
		[TransactionName, ethers.ContractTransaction],
		void,
		void
	>;
	numStages: number;
}
