// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "typedjson";
import { Asset } from "./asset";
import { ABIValue, CustomJSON } from "#erdstall/api/util";
import { ErdstallToken } from "#erdstall/api/responses";
import { Address } from "#erdstall/ledger";

export const ETHZERO = "0x0000000000000000000000000000000000000000";

@jsonObject
export class Assets implements ABIValue {
	public values: Map<string, Asset>;

	constructor(...assets: { token: string | Address; asset: Asset }[]) {
		this.values = new Map<string, Asset>();
		assets.forEach(({ token, asset }) => this.addAsset(token, asset));
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
		return "tuple(address token,bytes value)[]";
	}

	asABI(): ErdstallToken[] {
		return this.orderedAssets().map(([addr, asset]) => {
			return {
				token: addr,
				value: asset.asABI(),
			};
		});
	}

	private orderedAssets(): [string, Asset][] {
		let assets: [string, Asset][] = [];
		for (const entry of this.values.entries()) {
			assets.push(entry);
		}
		return assets.sort(
			(
				[addr1, _]: [string, Asset],
				[addr2, __]: [string, Asset],
			): number => {
				return addr1.localeCompare(addr2);
			},
		);
	}

	hasAsset(addr: string | Address): boolean {
		if (addr instanceof Address) addr = addr.toString();
		return this.values.has(addr);
	}

	addAssets(assets: Assets): void {
		const it = assets.values.entries();
		for (let next = it.next(); !next.done; next = it.next()) {
			const [k, v] = next.value;
			this.addAsset(k, v);
		}
	}

	addAsset(addr: string | Address, asset: Asset): void {
		if (addr instanceof Address) addr = addr.toString();
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
