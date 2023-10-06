// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { jsonObject } from "#erdstall/export/typedjson";
import { equalArray } from "#erdstall/utils/arrays";
import { ABIValue, customJSON } from "#erdstall/api/util";
import { Address, registerAddressType } from "#erdstall/crypto/address";

/**
 * This class implements an address representation and is used within the SDK
 * wherever an address is required.
 */
@jsonObject
export class EthereumAddress extends Address<"ethereum"> implements ABIValue {
	private value: Uint8Array;
	constructor(value: Uint8Array) {
		super();
		this.value = value;
	}

	static fromJSON(val: any): EthereumAddress {
		return new EthereumAddress(
			utils.arrayify(val, { allowMissingPrefix: true }),
		);
	}

	static toJSON(me: EthereumAddress): any {
		return me.toJSON();
	}

	public toJSON(): any {
		return utils.hexlify(this.value);
	}

	static fromString(addr: string): EthereumAddress {
		return EthereumAddress.fromJSON(addr);
	}

	static ensure(addr: string | EthereumAddress): EthereumAddress {
		if (addr === undefined) return addr;
		if (addr instanceof EthereumAddress) return addr;
		return EthereumAddress.fromString(addr);
	}

	type(): "ethereum" {
		return "ethereum";
	}

	toString(): string {
		return utils.getAddress(utils.hexlify(this.value));
	}

	get key(): string {
		return this.toJSON();
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

registerAddressType("ethereum", EthereumAddress);
customJSON(EthereumAddress);

export function addressKey(addr: Address<"ethereum"> | string): string {
	return addr instanceof Address<"ethereum"> ? addr.key : addr.toLowerCase();
}
