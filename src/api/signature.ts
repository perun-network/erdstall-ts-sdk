// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, BytesLike } from "ethers";
import { jsonObject } from "#erdstall/export/typedjson";
import { ABIValue, customJSON } from "./util";

@jsonObject
export class Signature implements ABIValue {
	value: Uint8Array;
	constructor(value: Uint8Array | BytesLike) {
		this.value = ethers.getBytes(value);
	}

	toString(): string {
		return ethers.hexlify(this.value);
	}
	static toJSON(me: Signature) {
		return ethers.hexlify(me.value);
	}
	static fromJSON(val: any): Signature {
		return new Signature(val);
	}

	asABI(): any {
		return this.value;
	}
	ABIType(): string {
		return "bytes";
	}
}

customJSON(Signature);
