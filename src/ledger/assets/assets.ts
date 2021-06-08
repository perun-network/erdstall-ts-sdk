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

	hasAsset(addr: string): boolean {
		return this.values.has(addr);
	}

	addAssets(assets: Assets): void {
		const it = assets.values.entries();
		for (let next = it.next(); !next.done; next = it.next()) {
			const [k, v] = next.value;
			this.addAsset(k, v);
		}
	}

	addAsset(addr: string, asset: Asset): void {
		if (asset.zero()) {
			return;
		}

		if (this.values.has(addr)) {
			this.values.get(addr)!.add(asset);
		} else {
			this.values.set(addr, asset);
		}
	}

	cmp(assets: Assets): "lt" | "eq" | "gt" | "uncomparable" {
		const res = ["lt", "eq", "gt"] as const;
		let swap = 1;
		let cmp = 0;
		let a = this.values;
		let b = assets.values;

		if (a.size < b.size) {
			a = b;
			b = this.values;
			swap = -1;
		}

		if (!isProperSubset(b, a)) {
			return "uncomparable";
		}

		const it = a.entries();
		for (let next = it.next(); !next.done; next = it.next()) {
			const [k, va] = next.value;

			const bHasNotToken = !b.has(k);
			if (bHasNotToken && cmp === -1) {
				return "uncomparable";
			} else if (bHasNotToken) {
				cmp = 1;
				continue;
			}

			const vb = b.get(k)!;
			const r = va.cmp(vb);
			if (r === "uncomparable") {
				return r;
			} else if (
				(r === "lt" && cmp === 1) ||
				(r === "gt" && cmp === -1)
			) {
				return "uncomparable";
			} else if (r !== "eq" && cmp === 0) {
				cmp = res.indexOf(r) - 1;
			}
		}
		return res[cmp * swap + 1];
	}
}

function isProperSubset(
	presumedSubset: Map<string, Asset>,
	presumedSuperset: Map<string, Asset>,
): boolean {
	const it = presumedSubset.keys();
	for (let k = it.next(); !k.done; k = it.next()) {
		if (!presumedSuperset.has(k.value)) {
			return false;
		}
	}
	return true;
}

CustomJSON(Assets);
