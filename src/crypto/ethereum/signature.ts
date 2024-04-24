// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";
import { registerSignatureType, Signature } from "#erdstall/crypto/signature";
import { EthereumAddress } from "./address";
import { Address } from "#erdstall/crypto/address";
import { jsonMember, jsonObject } from "#erdstall/export/typedjson";

@jsonObject
export class EthereumSignature extends Signature<"ethereum"> {
	@jsonMember bytes: Uint8Array;

	constructor(value: Uint8Array) {
		super();
		this.bytes = value;
	}

	static fromJSON(data: any): Signature<"ethereum"> {
		if(typeof data !== "string") {
			throw new Error("Expected to decode address from a string");
		}
		return new EthereumSignature(ethers.getBytes(data));
	}

	verify(msg: Uint8Array, signer: Address<"ethereum">): boolean {
		return ethers.verifyMessage(msg, this.toString()) === signer.toString()
	}

	toJSON() {
		return ethers.hexlify(this.bytes);
	}

	toString(): string {
		return ethers.hexlify(this.bytes);
	}

	toBytes(): Uint8Array {
		return this.bytes;
	}

	asABI() {
		return this.bytes;
	}

	ABIType(): string {
		return "bytes";
	}

	type(): "ethereum" {
		return "ethereum";
	}
}

registerSignatureType("ethereum", EthereumSignature);
