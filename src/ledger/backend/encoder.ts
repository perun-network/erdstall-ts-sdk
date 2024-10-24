// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Backend } from "#erdstall/ledger/backend/backends";
import { BackendAddress } from "#erdstall";
import { Chain } from "../chain";
import { ChainProof } from "#erdstall/api/responses";

export interface Encoder<B extends Backend> {
	// Encodes the given ChainProofDesc into a signable representation for the
	// instantiating backend. The resulting Uint8Array can be used to verify
	// that the proofs were indeed issued by enclave running Erdstall.
	encode(desc: ChainProofDesc<B>): EncodedChainProof;
}

export type EncodedChainProof = {
	encodedExits: Uint8Array[];
	encodedRecoveries: Uint8Array[];
};

// Descriptor for ChainProofs tying together the address and chain for which
// the given ChainProof was signed.
export type ChainProofDesc<B extends Backend> = {
	address: BackendAddress<B>;
	epoch: bigint;
	chain: Chain;
	proofs: ChainProof;
};
