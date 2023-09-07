// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Bytes, Signer as EthersSigner, utils } from "ethers";
import { Signer } from "#erdstall/ledger/backend";
import { Signature } from "#erdstall/ledger/signature";
import { Address } from "#erdstall/ledger";
import { EthereumSignature } from "./signature";

// Compile-time check that the EthersSigner implements the Signer interface.
export class EthereumSigner implements Signer<"ethereum"> {
	readonly address: Address<"ethereum">;
	readonly ethersSigner: EthersSigner;

	constructor(address: Address<"ethereum">, ethersSigner: EthersSigner) {
		this.address = address;
		this.ethersSigner = ethersSigner;
	}

	async signMessage(message: string | Bytes): Promise<Signature<"ethereum">> {
		const sig = await this.ethersSigner.signMessage(
			utils.keccak256(message),
		);
		return new EthereumSignature(utils.arrayify(sig), this.address);
	}
}
