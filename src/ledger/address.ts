// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { jsonObject } from "#erdstall/export/typedjson";
import { equalArray } from "#erdstall/utils/arrays";
import { ABIValue, customJSON } from "#erdstall/api/util";

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

	static ensure(addr: string | Address): Address {
		if (addr === undefined) return addr;
		if (addr instanceof Address) return addr;
		return Address.fromString(addr);
	}

	toString(): string {
		return utils.getAddress(utils.hexlify(this.value));
	}

	get key(): string {
		return Address.toJSON(this);
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
		return equalArray(this.value, other.value);
	}
}

customJSON(Address);

export function addressKey(addr: Address | string): string {
	return addr instanceof Address ? addr.key : addr.toLowerCase();
}
