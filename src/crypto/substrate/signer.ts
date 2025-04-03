// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer as EthersSigner, ethers } from "ethers";
import { Address, Signature, Signer } from "#erdstall/crypto";
import {
	sr25519PairFromSeed, sr25519Sign, cryptoWaitReady
} from "@polkadot/util-crypto";
import { Keypair } from "@polkadot/util-crypto/types";
import { SubstrateSignature } from "./signature";
import { SubstrateAddress } from "./address";

export class SubstrateSigner extends Signer<"substrate"> {
	readonly keyPair: Keypair;

	constructor(keyPair: Keypair) {
		super();
		this.keyPair = keyPair;
	}

	type(): "substrate" { return "substrate"; }


	async sign(message: Uint8Array): Promise<Signature<"substrate">> {
		await cryptoWaitReady();
		const sig = sr25519Sign(message, this.keyPair);
		return new SubstrateSignature(sig);
	}

	address(): SubstrateAddress
		{ return new SubstrateAddress(this.keyPair.publicKey); }

	// Generates a unique random custodial account. Returns a signer, its
	// associated account's address, and the private key used for restoring
	// that account later using `restoreCustodialAccount()`.
	// WARNING: the randomness used to generate this account is insecure.
	// TODO: use unchecked code to access the crypto API.
	static async generateCustodialAccount(): Promise<{
		signer: SubstrateSigner;
		seed: Uint8Array;
	}> {
		let seed = new Uint8Array(32);
		for(let i = 0; i < seed.length; i++)
			seed[i] = (Math.random() * 512) & 0xff; // NOTE SECURITY: unsafe, but portable. The web crypto API is not available on node.js until v19.

		await cryptoWaitReady();
		let keys = sr25519PairFromSeed(seed)
		return {
			signer: new SubstrateSigner(keys),
			seed,
		};
	}

	// Restores a custodial account from its private key, as returned by
	// `generateCustodialAccount()`. Returns a signer and the associated
	// account's address.
	static async restoreCustodialAccount(seed: string): Promise<SubstrateSigner> {
		await cryptoWaitReady();
		let keys = sr25519PairFromSeed(seed)
		return new SubstrateSigner(keys);
	}

	static async Alice(): Promise<SubstrateSigner> {
		return SubstrateSigner.restoreCustodialAccount("0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a");
	}

	static async Bob(): Promise<SubstrateSigner> {
		return SubstrateSigner.restoreCustodialAccount("0x398f0c28f98885e046333d4a41c19cee4c37368a9832c6502f6cfd182e2aef89");
	}
}

