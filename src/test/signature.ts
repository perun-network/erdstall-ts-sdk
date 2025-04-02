// SPDX-License-Identifier: Apache-2.0
"use strict";

import { TestAddress } from "./address";
import { Address, registerSignatureType, Signature } from "#erdstall/crypto";
import { jsonMember, jsonObject } from "#erdstall/export/typedjson";

@jsonObject
export class TestSignature extends Signature<"test"> {
	@jsonMember(String)
	msg: string;

	@jsonMember(() => TestAddress)
	address: TestAddress | null;

	constructor(msg: string, address: TestAddress | null) {
		super();
		this.msg = msg;
		this.address = address;
	}

	override clone(): this {
		return new TestSignature(this.msg, this.address?.clone() ?? null) as this;
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
		const address = (data.address ?? null) == null ? null :
			TestAddress.fromJSON(data.address);
		const value = data.msg;
		return new TestSignature(value, address);
	}

	verify(msg: Uint8Array, addr: Address<"test">): boolean {
		const enc = Array.from(msg).map(x => x.toString(16).padStart(2, "0")).join("");
		return this.msg === enc && addr ? this.address ? addr.equals(this.address) : false : true;
	}

	toJSON() {
		return {
			address: this.address?.toJSON(),
			msg: this.msg,
		};
	}

	type(): "test" {
		return "test";
	}
}

registerSignatureType("test", TestSignature);
