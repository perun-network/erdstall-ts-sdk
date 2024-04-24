// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer as EthersSigner, ethers } from "ethers";
import { Address, Signature, Signer } from "#erdstall/crypto";
import { sr25519PairFromSeed, sr25519Sign } from "@polkadot/util-crypto";
import { Keypair } from "@polkadot/util-crypto/types";
import { SubstrateSignature } from "./signature";
import { SubstrateAddress } from "./address";

// Compile-time check that the EthersSigner implements the Signer interface.
export class SubstrateSigner implements Signer<"substrate"> {
	readonly keyPair: Keypair;

	constructor(keyPair: Keypair) {
		this.keyPair = keyPair;
	}

	sign(message: Uint8Array): Promise<Signature<"substrate">> {
		const sig = sr25519Sign(message, this.keyPair);
		return Promise.resolve(new SubstrateSignature(sig))
	}

	async address(): Promise<Address<"substrate">> {
		return new SubstrateAddress(this.keyPair.publicKey);
	}

	// Generates a unique random custodial account. Returns a signer, its
	// associated account's address, and the private key used for restoring
	// that account later using `restoreCustodialAccount()`.
	// WARNING: the randomness used to generate this account is insecure.
	static generateCustodialAccount(): {
		signer: SubstrateSigner;
		seed: Uint8Array;
	} {
		let seed = new Uint8Array(32);
		for(let i = 0; i < seed.length; i++)
			seed[i] = (Math.random() * 512) & 0xff; // NOTE SECURITY: unsafe, but portable. The web crypto API is not available on node.js until v19.

		let keys = sr25519PairFromSeed(seed)
		return {
			signer: new SubstrateSigner(keys),
			seed,
		};
	}

	// Restores a custodial account from its private key, as returned by
	// `generateCustodialAccount()`. Returns a signer and the associated
	// account's address.
	static restoreCustodialAccount(seed: string): SubstrateSigner {
		let keys = sr25519PairFromSeed(seed)
		return new SubstrateSigner(keys);
	}
}

