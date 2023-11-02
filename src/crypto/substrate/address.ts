// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";
import { Address } from "#erdstall/crypto/address";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { hexToU8a, u8aToHex } from "@polkadot/util"

/**
 * This class implements an address representation and is used within the SDK
 * wherever an address is required.
 */
@jsonObject
export class SubstrateAddress implements Address<"substrate"> {
	private value: Uint8Array;
	constructor(value: Uint8Array) {
		this.value = value;
	}

	static fromJSON(val: any): SubstrateAddress {
		if(typeof val !== "string") {
			throw new Error("Expected to decode address from a string");
		}
		return new SubstrateAddress(decodeAddress(hexToU8a(val)));
	}

	toJSON(): string {
		return u8aToHex(this.value);
	}

	static fromString(addr: string): SubstrateAddress {
		return new SubstrateAddress(decodeAddress(addr));
	}

	static ensure(addr: string | SubstrateAddress): SubstrateAddress {
		if (addr === undefined) return addr;
		if (addr instanceof SubstrateAddress) return addr;
		return SubstrateAddress.fromString(addr);
	}

	type(): "substrate" {
		return "substrate";
	}

	toString(): string {
		return encodeAddress(this.value);
	}

	get key(): string {
		return this.toJSON()
	}

	equals(other: SubstrateAddress): boolean {
		return this.key == other.key
	}
}

customJSON(SubstrateAddress);

export function addressKey(addr: SubstrateAddress | string): string {
	return SubstrateAddress.ensure(addr).key;
}
