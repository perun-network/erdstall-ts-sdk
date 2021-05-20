// SPDX-License-Identifier: Apache-2.0
"use strict";

import { BigNumber, utils } from "ethers";
import { Asset, TypeTags } from "./asset";

/** Amount represents a currency amount in its smallest unit. */
export class Amount extends Asset {
	public value: bigint;

	constructor(v: bigint) {
		super();
		this.value = v;
	}

	toJSON() {
		return utils.hexlify(BigNumber.from(this.value));
	}

	static fromJSON(hexString: string): Amount {
		return new Amount(BigInt(hexString));
	}

	typeTag(): string { return TypeTags.Amount; }
}
