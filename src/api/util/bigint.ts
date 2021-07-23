// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Option, none, some } from "fp-ts/lib/Option";
import { jsonObject } from "typedjson";
import { BigNumber } from "ethers";

import { MAX_AMOUNT_VALUE } from "#erdstall/ledger/assets";
import { ABIEncodable } from "./abiencoder";
import { CustomJSON } from "./customjson";

@jsonObject
export class BigInteger implements ABIEncodable {
	private value: bigint;

	constructor(value: bigint) {
		this.value = value;
	}

	static fromJSON(val: any): BigInteger {
		return new BigInteger(BigInt(val));
	}
	static toJSON(me: bigint): string {
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

function isUint256(value: bigint): value is Uint256 {
	return value >= 0 && value <= MAX_AMOUNT_VALUE;
}

export function mkUint256(value: bigint): Option<Uint256> {
	return isUint256(value) ? some(value) : none;
}
