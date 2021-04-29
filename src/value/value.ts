// SPDX-License-Identifier: Apache-2.0

import IDSet from "./idset";
import Uint from "./uint";

export type Value = Uint | IDSet;

enum EncodedValues {
	uint = "uint",
	idset = "idset",
}

export default class Values {
	public values: Map<string, Value>;

	constructor() {
		this.values = new Map<string, Value>();
	}

	toJSON() {
		var obj: any = {};
		this.values.forEach((v, k) => {
			var withTypeEncoded: any = {};
			withTypeEncoded[this.resolveType(v)] = v;
			obj[k] = withTypeEncoded;
		});
		return obj;
	}

	private resolveType(v: Value): string {
		if (v instanceof Uint) {
			return EncodedValues.uint;
		} else if (v instanceof IDSet) {
			return EncodedValues.idset;
		} else {
			return "unknown";
		}
	}

	static fromJSON(data: string): Values {
		const vs = new Values();
		const res = JSON.parse(data);
		for (const k in res) {
			for (const v in res[k]) {
				switch (v) {
					case EncodedValues.idset:
						vs.values.set(k, IDSet.fromJSON(res[k][v]));
						break;
					case EncodedValues.uint:
						vs.values.set(k, Uint.fromJSON(res[k][v]));
						break;
					default:
						return vs;
				}
			}
		}
		return vs;
	}
}
