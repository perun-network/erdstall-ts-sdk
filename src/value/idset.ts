// SPDX-License-Identifier: Apache-2.0

import { BigNumber, utils } from "ethers";

export default class IDSet {
	public value: bigint[];

	constructor(v: bigint[]) {
		this.value = v;
	}

	toJSON() {
		return this.value.map((val) => {
			return utils.hexlify(BigNumber.from(val));
		});
	}

	static fromJSON(idset: string[]): IDSet {
		const s = new Array<bigint>();
		for (const id in idset) {
			s.push(BigInt(idset[id]));
		}
		return new IDSet(s);
	}
}
