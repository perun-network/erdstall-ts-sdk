// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "typedjson";
import { BigNumber } from "ethers";
import { ABIEncodable } from "./abiencoder";
import { CustomJSON } from "./customjson";

@jsonObject export class BigInteger implements ABIEncodable {
	private value: bigint;

	constructor(value: bigint) {
		this.value = value;
	}

	static fromJSON(val: any): BigInteger { return new BigInteger(BigInt(val)); }
	static toJSON(me: bigint): string { return me.toString(); }

	toString():string { return this.value.toString(); }
	valueOf(): bigint { return this.value; }
	asABI(): any { return BigNumber.from(this.value); }
}

CustomJSON(BigInteger);
