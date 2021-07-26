// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Option, none, some } from "fp-ts/lib/Option";
import { jsonObject } from "typedjson";
import { BigNumber } from "ethers";

import { ABIEncodable } from "./abiencoder";
import { CustomJSON } from "./customjson";

// `Prettier` has no option to ignore mathexpressions and contrary to whatever
// `Prettier` is deducing, the statement:
//
//        `(1n << 256n) - 1n` == `1n << 256n - 1n`
//
//  is NOT true...
//
//  This seems to be fixed in the newest release of `Prettier`, but we will
//  keep the `prettier-ignore` line here to be 100% sure it does not get
//  formatted on accident.

// prettier-ignore
export const MAX_UINT256 = (1n << 256n) - 1n;

@jsonObject
export class BigInteger implements ABIEncodable {
	private value: bigint;

	constructor(value: bigint) {
		this.value = value;
	}

	static fromJSON(val: any): BigInteger {
		return new BigInteger(BigInt(val));
	}
	static toJSON(me: BigInteger): string {
		return me.toString();
	}

	toString(): string {
		return this.value.toString();
	}
	valueOf(): bigint {
		return this.value;
	}
	asABI(): any {
		return BigNumber.from(this.value);
	}

	equals(other: BigInteger): boolean {
		return this.value === other.value;
	}
}

CustomJSON(BigInteger);

export type Uint256 = bigint;

export function isUint256(value: bigint): value is Uint256 {
	return value >= 0 && value <= MAX_UINT256;
}

export function mkUint256(value: bigint): Option<Uint256> {
	return isUint256(value) ? some(value) : none;
}
