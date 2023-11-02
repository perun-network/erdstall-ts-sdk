// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signature, Address } from "#erdstall/crypto";
import { isHex, hexToU8a, u8aToHex } from "@polkadot/util";
import { signatureVerify } from "@polkadot/util-crypto";

export class SubstrateSignature implements Signature<"substrate"> {
	private bytes: Uint8Array;

	constructor(bytes: Uint8Array) {
		this.bytes = bytes;
	}

	verify(msg: Uint8Array, addr: Address<"substrate">) {
		return signatureVerify(
			msg,
			this.toBytes(),
			addr.toString(),
		).isValid;
	}

	toBytes(): Uint8Array {
		return this.bytes;
	}
	toString(): string {
		return this.toJSON()
	}

	type(): "substrate" {
		return "substrate";
	}

	static fromJSON(data: any): Signature<"substrate"> {
		if(typeof data !== "string") {
			throw new Error("Expected to decode address from a string")
		}
		return new SubstrateSignature(hexToU8a(data));
	}
	toJSON() {
		return u8aToHex(this.bytes);
	}
}
