// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { jsonObject } from "#erdstall/export/typedjson";
import { equalArray } from "#erdstall/utils/arrays";
import { ABIValue, customJSON } from "#erdstall/api/util";
import { Address } from "#erdstall/ledger/address";

// // Map key
// TODO: Substrate uses Pallets, we do not have an address for each pallet?
// type AddrKey struct {
// 	Type string `json:"type"` // addr.Type()
// 	Key  string `json:"key"`  // addr.Key()
// }
// TODO: Switch over type, parse key as expected by backends.

/**
 * This class implements an address representation and is used within the SDK
 * wherever an address is required.
 */
@jsonObject
export class EthereumAddress implements ABIValue, Address {
	private value: Uint8Array;
	constructor(value: Uint8Array) {
		this.value = value;
	}

	static fromJSON(val: any): EthereumAddress {
		return new EthereumAddress(utils.arrayify(val));
	}

	static toJSON(me: EthereumAddress) {
		return utils.hexlify(me.value);
	}

	static fromString(addr: string): EthereumAddress {
		return EthereumAddress.fromJSON(addr);
	}

	static ensure(addr: string | EthereumAddress): EthereumAddress {
		if (addr === undefined) return addr;
		if (addr instanceof EthereumAddress) return addr;
		return EthereumAddress.fromString(addr);
	}

	typ(): "ethereum" {
		return "ethereum";
	}

	toString(): string {
		return utils.getAddress(utils.hexlify(this.value));
	}

	get key(): string {
		return EthereumAddress.toJSON(this);
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

	equals(other: EthereumAddress): boolean {
		return equalArray(this.value, other.value);
	}
}

customJSON(EthereumAddress);

export function addressKey(addr: EthereumAddress | string): string {
	return addr instanceof EthereumAddress ? addr.key : addr.toLowerCase();
}
