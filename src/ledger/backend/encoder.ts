// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Chain } from "../chain";
import { Address } from "#erdstall/crypto";
import { ChainProof } from "#erdstall/api/responses";

export interface Encoder {
	// Encodes the given ChainProofDesc into a signable representation for the
	// instantiating backend. The resulting Uint8Array can be used to verify
	// that the proofs were indeed issued by enclave running Erdstall.
	encode(desc: ChainProofDesc): EncodedChainProof;
}

export type EncodedChainProof = {
	encodedExits: Uint8Array[];
	encodedRecoveries: Uint8Array[];
};

// Descriptor for ChainProofs tying together the address and chain for which
// the given ChainProof was signed.
export type ChainProofDesc = {
	address: Address;
	epoch: bigint;
	chain: Chain;
	proofs: ChainProof;
};