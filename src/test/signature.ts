// SPDX-License-Identifier: Apache-2.0
"use strict";

import { TestAddress } from "./address";
import { Address, registerSignatureType, Signature } from "#erdstall/crypto";
import { jsonMember, jsonObject } from "#erdstall/export/typedjson";

@jsonObject
export class TestSignature extends Signature<"test"> {
	@jsonMember(String)
	msg: string;

	@jsonMember(Address)
	address: Address<"test">;

	constructor(msg: string, address: Address<"test">) {
		super();
		this.msg = msg;
		this.address = address;
	}

	asABI(): Uint8Array {
		throw new Error("Method not implemented.");
	}
	ABIType(): string {
		throw new Error("Method not implemented.");
	}
	toString(): string {
		throw new Error("Method not implemented.");
	}
	toBytes(): Uint8Array {
		return new TextEncoder().encode(this.msg);
	}

	static fromJSON(data: any): Signature<"test"> {
		const address = TestAddress.fromJSON(data.address);
		const value = data.msg;
		return new TestSignature(value, address);
	}

	toJSON() {
		return {
			address: Address.toJSON(this.address),
			msg: this.msg,
		};
	}

	type(): "test" {
		return "test";
	}
}

registerSignatureType("test", TestSignature);
