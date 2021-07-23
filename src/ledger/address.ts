// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { jsonObject } from "typedjson";
import { ABIValue, CustomJSON } from "#erdstall/api/util";

@jsonObject
export class Address implements ABIValue {
	private value: Uint8Array;
	constructor(value: Uint8Array) {
		this.value = value;
	}

	static fromJSON(val: any): Address {
		return new Address(utils.arrayify(val));
	}

	static toJSON(me: Address) {
		return utils.hexlify(me.value);
	}

	static fromString(addr: string): Address {
		return Address.fromJSON(addr);
	}

	toString(): string {
		return utils.getAddress(utils.hexlify(this.value));
	}

	asABI(): any {
		return this.toString();
	}

	ABIType(): string {
		return "address";
	}

	isZero(): boolean {
		return this.value.every((x) => x === 0);
	}

	equals(other: Address): boolean {
		return (this.value.length === other.value.length)
			&& this.value.every((x, i) => x === other.value[i]);
	}
}

CustomJSON(Address);
