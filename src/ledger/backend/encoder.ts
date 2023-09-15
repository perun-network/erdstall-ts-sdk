// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Backend } from "#erdstall/ledger/backend/backends";
import { BalanceProof } from "#erdstall/api/responses";

export interface Encoder<_B extends Backend> {
	// Encodes the given BalanceProof into a byte array. The resulting
	// encoding is the backend specific representation of proofs used for on-chain
	// verification & validation.
	encode(proof: BalanceProof): Uint8Array;
}
