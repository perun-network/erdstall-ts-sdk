// SPDX-License-Identifier: Apache-2.0
"use strict";

import { BigNumber, utils } from "ethers";
import { Asset, TypeTags } from "./asset";
import { BigInteger, ABIEncoder } from "../../api/util";

export class Tokens extends Asset {
	public value: bigint[];

	constructor(v: bigint[]) {
		super();
		this.value = v;
	}

	toJSON() {
		return this.value.map((val) => {
			return utils.hexlify(BigNumber.from(val));
		});
	}

	static fromJSON(idset: string[]): Tokens {
		const s = new Array<bigint>();
		for (const id in idset) {
			s.push(BigInt(idset[id]));
		}
		return new Tokens(s);
	}

	typeTag(): string { return TypeTags.Tokens; }

	asABI(): any {
		let ids = [];
		this.value.forEach((v) => { ids.push(new BigInteger(v).asABI()); });
		return new ABIEncoder("uint256[]", ids).pack_noprefix();
	}
}
