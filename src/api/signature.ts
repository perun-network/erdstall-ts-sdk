// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { jsonObject } from "typedjson";
import { ABIValue, CustomJSON } from "./util";

@jsonObject export class Signature implements ABIValue {
	value: Uint8Array;
	constructor(value: Uint8Array) {
		this.value = value;
	}

	static toJSON(me: Signature) { return utils.hexlify(me.value); }
	static fromJSON(val: any): Signature {
		return new Signature(utils.arrayify(val));
	}

	asABI(): any { return this.value; }
	ABIType(): string { return "bytes"; }
}

CustomJSON(Signature);