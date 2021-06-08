// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "typedjson";
import { utils } from "ethers";
import { Asset } from "./asset";
import { ABIEncoder, ABIValue, CustomJSON } from "../../api/util";
import { Address } from "../address";

@jsonObject
export class Assets implements ABIValue {
	public values: Map<string, Asset>;

	constructor() {
		this.values = new Map<string, Asset>();
	}

	static toJSON(me: Assets) {
		var obj: any = {};
		me.values.forEach((v, k) => {
			var withTypeEncoded: any = {};
			withTypeEncoded[v.typeTag()] = v.toJSON();
			obj[k] = withTypeEncoded;
		});
		return obj;
	}

	static fromJSON(data: any): Assets {
		const vs = new Assets();
		for (const k in data) {
			vs.values.set(k, Asset.fromJSON(data[k]));
		}
		return vs;
	}

	ABIType(): string {
		return "(address,bytes)[]";
	}
	asABI(): any {
		let valuesArr: [any, any][] = [];
		this.values.forEach((v, k) => {
			valuesArr.push([Address.fromJSON(k).asABI(), v.asABI()]);
		});
		return valuesArr;
	}
}

CustomJSON(Assets);
