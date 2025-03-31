// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";
import { registerSignatureType, Signature } from "#erdstall/crypto";
import { EthereumAddress } from "./address";
import { Address } from "#erdstall/crypto";
import { jsonObject } from "#erdstall/export/typedjson";
import { parseHex, toHex } from "#erdstall/utils/hexbytes";
import { customJSON } from "#erdstall/api/util";

@jsonObject
export class EthereumSignature extends Signature<"ethereum"> {
	bytes: Uint8Array;

	constructor(value: Uint8Array) {
		super();
		this.bytes = new Uint8Array(value); // explicit deep copy!
	}

	static fromJSON(data: any): Signature<"ethereum"> {
		if(typeof data !== "string") {
			throw new Error("Expected to decode address from a string");
		}
		return new EthereumSignature(parseHex(data, "0x"));
	}

	override clone(): this
		{ return new EthereumSignature(this.bytes) as this; }

	verify(msg: Uint8Array, signer: Address<"ethereum">): boolean {
		const d = ethers.getBytes(ethers.keccak256(msg));
		return ethers.verifyMessage(d, this.toString()) === signer.toString();
	}

	toJSON() { return toHex(this.bytes, "0x"); }

	toString(): string { return toHex(this.bytes, "0x"); }

	toBytes(): Uint8Array { return this.bytes; }

	asABI() { return this.bytes; }

	ABIType(): string { return "bytes"; }

	type(): "ethereum" { return "ethereum"; }
}

registerSignatureType("ethereum", EthereumSignature);
customJSON(EthereumSignature);