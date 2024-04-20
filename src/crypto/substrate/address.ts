// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";
import { Address, registerAddressType } from "#erdstall/crypto/address";
import { equalArray } from "#erdstall/utils/arrays";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { hexToU8a, u8aToHex } from "@polkadot/util"

/**
 * This class implements an address representation and is used within the SDK
 * wherever an address is required.
 */
@jsonObject
export class SubstrateAddress extends Address<"substrate"> {
	private value: Uint8Array;
	constructor(value: Uint8Array) {
		super();
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

	equals(other: SubstrateAddress): boolean {
		return equalArray(this.value, other.value);
	}
}

registerAddressType("substrate", SubstrateAddress);
customJSON(SubstrateAddress);

export function addressKey(addr: SubstrateAddress | string): string {
	return SubstrateAddress.ensure(addr).key;
}
