// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";
import {
	jsonMapMember,
	jsonMember,
	jsonObject,
	MapShape,
} from "#erdstall/export/typedjson";
import { Asset } from "./asset";
import { customJSON } from "#erdstall/api/util";
import { Address, addressKey, Crypto, AssetID } from "#erdstall/crypto";
import { Amount } from "./amount";
import { Tokens } from "./tokens";
import { Chain } from "../chain";
import { toHex, parseHex } from "#erdstall/utils/hexbytes";

export const ETHZERO = "0x0000000000000000000000000000000000000000";

@jsonObject
export class ChainAssets {
	@jsonMapMember(Number, () => LocalAssets, { shape: MapShape.OBJECT })
	public assets: Map<Chain, LocalAssets>;

	constructor(assets?: Map<Chain, LocalAssets>) {
		this.assets = assets ?? new Map();
	}

	static fromJSON(data: any): ChainAssets {
		const vs = new Map<Chain, LocalAssets>();
		for (const k of Object.keys(data)) {
			vs.set(parseInt(k), LocalAssets.fromJSON(data[k]));
		}
		return new ChainAssets(vs);
	}

	static toJSON(me: ChainAssets) {
		var obj: any = {};
		me.assets.forEach((v, k) => {
			obj[k] = LocalAssets.toJSON(v);
		});
		return obj;
	}

	clone(): ChainAssets
		{ return ChainAssets.fromJSON(ChainAssets.toJSON(this)); }

	addAsset(chain: Chain, localID: Uint8Array, asset: Asset) {
		if(!this.assets.has(chain))
			this.assets.set(chain, new LocalAssets());
		if (asset instanceof Amount) {
			this.assets.get(chain)!.fungibles.addAsset(localID, asset);
		} else if (asset instanceof Tokens) {
			this.assets.get(chain)!.nfts.addAsset(localID, asset);
		} else throw new Error("Unhandled asset type");
	}

	cmp(other: ChainAssets): -1 | 0 | 1 | undefined {
		const lhs = this.ordered();
		const rhs = other.ordered();

		const min = lhs.length < rhs.length ? lhs : rhs;
		const max = lhs.length < rhs.length ? rhs : lhs;
		const minsz = min.length;
		const maxsz = max.length;
		const flip_sign = lhs.length < rhs.length ? 1 : -1;

		let bigger = false;
		let smaller = false;
		for(let i = 0; i < minsz; i++)
		{
			let sign: number | undefined = min[i][0].cmp(max[i][0]);
			if(sign < 0) smaller = true;
			else if(sign > 0) bigger = true;
			else
			{
				let a = min[i][1];
				let b = max[i][1];

				if(a instanceof Tokens)
					sign = (a as Tokens).cmp(b as Tokens);
				else
					sign = (a as Amount).cmp(b as Amount);

				if(sign === undefined)
					return undefined;

				if(sign < 0) smaller = true;
				else if(sign > 0) bigger = true;
			}

			if(bigger && smaller)
				return undefined;
		}

		if(minsz != maxsz)
			smaller = true;

		if(bigger && smaller) return undefined;

		return (smaller ? -flip_sign : bigger ? flip_sign : 0) as any;
	}

	ordered(): [AssetID, Asset][] {
		const res = new Array<Array<[AssetID, Asset]>>();
		for (const [chain, locals] of this.assets) {
			const localList = new Array<[AssetID, Asset]>();
			for (const [token, amount] of locals.fungibles.assets) {
				localList.push([
					AssetID.fromMetadata(chain, 0, ethers.getBytes(token)),
					amount,
				]);
			}
			for (const [token, tokens] of locals.nfts.assets) {
				localList.push([
					AssetID.fromMetadata(chain, 1, ethers.getBytes(token)),
					tokens,
				]);
			}
			localList.sort(([ida, _a], [idb, _b]) => ida.cmp(idb));
			res.push(localList);
		}

		res.sort((a, b) => a[0][0].origin() - b[0][0].origin());

		return res.flat();
	}
}

@jsonObject
export class LocalFungibles {
	@jsonMapMember(String, () => Amount, { shape: MapShape.OBJECT })
	public assets: Map<string, Amount>;
	constructor(assets?: Map<string, Amount>) {
		this.assets = assets ?? new Map();
	}

	static fromJSON(data: any): LocalFungibles {
		const assets = new Map<string, Amount>();
		for (const k of Object.keys(data)) {
			assets.set(k, Amount.fromJSON(data[k]));
		}
		return new LocalFungibles(assets);
	}

	static toJSON(me: LocalFungibles) {
		var obj: any = {};
		me.assets.forEach((v, k) => {
			obj[k] = v.toJSON();
		});
		return obj;
	}

	addAsset(localID: Uint8Array, asset: Amount) {
		const token = toHex(localID, "0x");
		let a = this.assets.get(token);
		if (a !== undefined) {
			a.add(asset);
		} else {
			a = asset.clone();
		}

		this.assets.set(token, a);
	}
}

@jsonObject
export class LocalNonFungibles {
	@jsonMapMember(String, () => Tokens, { shape: MapShape.OBJECT })
	public assets: Map<string, Tokens>;
	constructor(assets?: Map<string, Tokens>) {
		this.assets = assets ?? new Map();
	}

	static fromJSON(data: any): LocalNonFungibles {
		const assets = new Map<string, Tokens>();
		for (const k of Object.keys(data)) {
			assets.set(k, Tokens.fromJSON(data[k]));
		}
		return new LocalNonFungibles(assets);
	}

	static toJSON(me: LocalNonFungibles) {
		var obj: any = {};
		me.assets.forEach((v, k) => {
			obj[k] = v.toJSON();
		});
		return obj;
	}

	addAsset(localID: Uint8Array, asset: Tokens) {
		const token = ethers.hexlify(localID);
		let a = this.assets.get(token);
		if (a !== undefined) {
			a.add(asset);
		} else {
			a = asset.clone();
		}

		this.assets.set(token, a);
	}
}

@jsonObject
export class LocalAssets {
	@jsonMember(() => LocalFungibles)
	public fungibles: LocalFungibles;
	@jsonMember(() => LocalNonFungibles)
	public nfts: LocalNonFungibles;
	constructor(fungibles?: LocalFungibles, nfts?: LocalNonFungibles) {
		this.fungibles = fungibles ?? new LocalFungibles();
		this.nfts = nfts ?? new LocalNonFungibles();
	}

	static fromJSON(data: any): LocalAssets {
		let fungibles = new LocalFungibles(new Map());
		let nfts = new LocalNonFungibles(new Map());
		if (data.fungibles) {
			fungibles = LocalFungibles.fromJSON(data.fungibles);
		}
		if (data.nfts) {
			nfts = LocalNonFungibles.fromJSON(data.nfts);
		}
		return new LocalAssets(fungibles, nfts);
	}

	static toJSON(me: LocalAssets) {
		let obj: { fungibles?: any; nfts?: any } = {};
		if (me.fungibles.assets.size > 0) {
			obj.fungibles = LocalFungibles.toJSON(me.fungibles);
		}
		if (me.nfts.assets.size > 0) {
			obj.nfts = LocalNonFungibles.toJSON(me.nfts);
		}
		return obj;
	}
}

@jsonObject
export class LocalAsset {
	@jsonMember(Uint8Array)
	public id: Uint8Array;
	constructor(id: Uint8Array) {
		this.id = id;
		if(this.id.length != 32)
			throw new Error(`Invalid length (${this.id.length}/32)`);
	}

	get isZero() {
		return Array.from(this.id).every(byte => byte === 0);
	}

	get key() { return toHex(this.id, ""); }
	static fromKey(key: string): LocalAsset {
		return new LocalAsset(parseHex(key));
	}
}

customJSON(ChainAssets);
customJSON(LocalFungibles);
customJSON(LocalNonFungibles);
customJSON(LocalAssets);
customJSON(LocalAsset);