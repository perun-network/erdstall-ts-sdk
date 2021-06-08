// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { jsonObject } from "typedjson";
import { ABIValue, CustomJSON } from "../api/util";

@jsonObject export class Address implements ABIValue {
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

	toString(): string { return utils.hexlify(this.value); }

	asABI(): any { return this.toString(); }
	ABIType():string { return "address"; }
}

CustomJSON(Address);
