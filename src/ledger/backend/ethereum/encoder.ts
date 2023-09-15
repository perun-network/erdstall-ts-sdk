// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { BalanceProof } from "#erdstall/api/responses";
import { Encoder } from "#erdstall/ledger/backend/encoder";
import { Erdstall } from "#erdstall/ledger/backend/ethereum/contracts/contracts";
import { ABIEncoder } from "#erdstall/api/util";

export class EthereumEncoder implements Encoder<"ethereum"> {
	encode(proof: BalanceProof): Uint8Array {
		// TODO: Implement as soon as BalanceProofs are finalized in core.
		throw new Error("Method not implemented.");
	}
}

function EncodeBalanceProof(p: BalanceProof) {}
