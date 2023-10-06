// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { jsonObject } from "#erdstall/export/typedjson";
import { Address, registerAddressType } from "#erdstall/crypto";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import * as crypto from "#erdstall/crypto";
import PRNG, { newRandomUint8Array } from "./random";
import { customJSON } from "#erdstall/api/util";

export function newRandomAddress(rng: PRNG): EthereumAddress {
	return new EthereumAddress(newRandomUint8Array(rng, 20));
}

@jsonObject
export class TestAddress extends Address<"test"> {
	private value: Uint8Array;

	constructor(value: Uint8Array) {
		super();
		this.value = value;
	}

	ABIType(): string {
		throw new Error("Method not implemented.");
	}

	get key(): string {
		throw new Error("Method not implemented.");
	}

	equals(_other: crypto.Address<crypto.Crypto>): boolean {
		throw new Error("Method not implemented.");
	}

	toString(): string {
		throw new Error("Method not implemented.");
	}

	toJSON(): string {
		return utils.hexlify(this.value);
	}

	fromJSON(val: any): TestAddress {
		return TestAddress.fromJSON(val);
	}

	static fromJSON(val: any): TestAddress {
		return new TestAddress(
			utils.arrayify(val, { allowMissingPrefix: true }),
		);
	}

	static toJSON(me: TestAddress): any {
		return me.toJSON();
	}

	type(): "test" {
		return "test";
	}
}

registerAddressType("test", TestAddress);
customJSON(TestAddress);
