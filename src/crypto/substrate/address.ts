// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "#erdstall/export/typedjson";
import { ABIValue, customJSON } from "#erdstall/api/util";
import { Address } from "#erdstall/crypto/address";

/**
 * This class implements an address representation and is used within the SDK
 * wherever an address is required.
 */
@jsonObject
export class SubstrateAddress implements ABIValue, Address<"substrate"> {
	private value: Uint8Array;
	constructor(value: Uint8Array) {
		this.value = value;
	}

	static fromJSON(val: any): SubstrateAddress {
		throw new Error("not implemented");
	}

	toJSON(): string {
		throw new Error("not implemented");
	}

	static fromString(addr: string): SubstrateAddress {
		return SubstrateAddress.fromJSON(addr);
	}

	static ensure(addr: string | SubstrateAddress): SubstrateAddress {
		if (addr === undefined) return addr;
		if (addr instanceof SubstrateAddress) return addr;
		return SubstrateAddress.fromString(addr);
	}

	type(): "ethereum" {
		return "ethereum";
	}

	toString(): string {
		throw new Error("not implemented");
	}

	get key(): string {
		throw new Error("not implemented");
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

	equals(other: SubstrateAddress): boolean {
		throw new Error("not implemented");
	}
}

customJSON(SubstrateAddress);

export function addressKey(addr: SubstrateAddress | string): string {
	return addr instanceof SubstrateAddress ? addr.key : addr.toLowerCase();
}
