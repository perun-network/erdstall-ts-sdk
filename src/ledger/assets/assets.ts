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
import { Backend } from "#erdstall/ledger/backend";
import { Amount } from "./amount";
import { Tokens } from "./tokens";
import { Chain } from "../chain";

export const ETHZERO = "0x0000000000000000000000000000000000000000";

@jsonObject
export class ChainAssets {
	@jsonMapMember(Number, () => LocalAssets, { shape: MapShape.OBJECT })
	public assets: Map<Chain, LocalAssets>;

	constructor(assets: Map<Chain, LocalAssets>) {
		this.assets = assets;
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

	addAsset(chain: Chain, localID: Uint8Array, asset: Asset) {
		if (asset instanceof Amount) {
			this.assets.get(chain)?.fungibles.addAsset(localID, asset);
		} else if (asset instanceof Tokens) {
			this.assets.get(chain)?.nfts.addAsset(localID, asset);
		} else throw new Error("Unhandled asset type");
	}

	cmp(other: ChainAssets): boolean {
		throw new Error("Method not implemented.");
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
	constructor(assets: Map<string, Amount>) {
		this.assets = assets;
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
		const token = ethers.hexlify(localID);
		const a = this.assets.get(token);
		if (a !== undefined) {
			a.add(asset);
		}

		this.assets.set(token, asset);
	}
}

@jsonObject
export class LocalNonFungibles {
	@jsonMapMember(String, () => Tokens, { shape: MapShape.OBJECT })
	public assets: Map<string, Tokens>;
	constructor(assets: Map<string, Tokens>) {
		this.assets = assets;
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
		const a = this.assets.get(token);
		if (a !== undefined) {
			a.add(asset);
		}

		this.assets.set(token, asset);
	}
}

@jsonObject
export class LocalAssets {
	@jsonMember(LocalFungibles)
	public fungibles: LocalFungibles;
	@jsonMember(LocalNonFungibles)
	public nfts: LocalNonFungibles;
	constructor(fungibles: LocalFungibles, nfts: LocalNonFungibles) {
		this.fungibles = fungibles;
		this.nfts = nfts;
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
	}

	get key(): string {
		return this.id.toString();
	}
}

customJSON(ChainAssets);
customJSON(LocalFungibles);
customJSON(LocalNonFungibles);
customJSON(LocalAssets);
customJSON(LocalAsset);