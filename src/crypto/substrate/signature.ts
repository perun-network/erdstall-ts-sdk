// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signature, registerSignatureType } from "#erdstall/crypto/signature";
import { Address } from "#erdstall/crypto/address";
import { parseHex, toHex } from "#erdstall/utils/hexbytes";
import { signatureVerify } from "@polkadot/util-crypto";
import { jsonObject } from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";

@jsonObject
export class SubstrateSignature extends Signature<"substrate"> {
	private bytes: Uint8Array;

	constructor(bytes: Uint8Array) {
		super();
		this.bytes = bytes;
	}

	static fromJSON(data: any): Signature<"substrate"> {
		if(typeof data !== "string") {
			throw new Error("Expected to decode address from a string")
		}
		return new SubstrateSignature(parseHex(data, "0x"));
	}
	verify(msg: Uint8Array, addr: Address<"substrate">) {
		return signatureVerify(
			msg,
			this.toBytes(),
			addr.toString(),
		).isValid;
	}

	toJSON() {
		return toHex(this.bytes, "0x");
	}

	toString(): string {
		return toHex(this.bytes, "0x")
	}

	toBytes(): Uint8Array {
		return this.bytes;
	}

	type(): "substrate" {
		return "substrate";
	}
}

registerSignatureType("substrate", SubstrateSignature);
customJSON(SubstrateSignature);