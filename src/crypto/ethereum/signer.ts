// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer as EthersSigner, Provider, ethers } from "ethers";
import { Signer, Address, Signature } from "#erdstall/crypto";
import { EthereumSignature } from "./signature";
import { EthereumAddress } from "./address";

// Compile-time check that the EthersSigner implements the Signer interface.
export class EthereumSigner implements Signer<"ethereum"> {
	#ethersSigner: EthersSigner;

	get ethersSigner(): EthersSigner { return this.#ethersSigner; }

	connect(p: Provider) { this.#ethersSigner = this.#ethersSigner.connect(p); }

	constructor(ethersSigner: EthersSigner) {
		this.#ethersSigner = ethersSigner;
	}

	async sign(message: Uint8Array): Promise<Signature<"ethereum">> {
		const sig = await this.ethersSigner.signMessage(
			ethers.getBytes(ethers.keccak256(message)));
		return new EthereumSignature(ethers.getBytes(sig));
	}

	async address(): Promise<EthereumAddress> {
		return EthereumAddress.fromString(await this.ethersSigner.getAddress());
	}

	// Generates a unique random custodial account. Returns a signer, its
	// associated account's address, and the private key used for restoring
	// that account later using `restoreCustodialAccount()`.
	static generateCustodialAccount(): {
		signer: EthereumSigner;
		privateKey: string;
	} {
		let wallet = ethers.Wallet.createRandom();
		return {
			signer: new EthereumSigner(wallet),
			privateKey: wallet.privateKey,
		};
	}

	// Restores a custodial account from its private key, as returned by
	// `generateCustodialAccount()`. Returns a signer and the associated
	// account's address.
	static restoreCustodialAccount(privateKey: string): EthereumSigner {
		let signer = new ethers.Wallet(privateKey);
		return new EthereumSigner(signer);
	}
}

