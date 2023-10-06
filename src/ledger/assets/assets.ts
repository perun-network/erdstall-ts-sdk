// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import {
	jsonMapMember,
	jsonMember,
	jsonObject,
	MapShape,
} from "#erdstall/export/typedjson";
import { Asset } from "./asset";
import { customJSON } from "#erdstall/api/util";
import { Address, addressKey, Crypto } from "#erdstall/crypto";
import { Backend, TokenProvider } from "#erdstall/ledger/backend";
import { Erdstall } from "#erdstall/ledger/backend/ethereum/contracts";
import { Amount, decodePackedAmount } from "./amount";
import { Tokens, decodePackedIds } from "./tokens";
import { TokenType } from "./asset";
import { Chain } from "../chain";

export const ETHZERO = "0x0000000000000000000000000000000000000000";

@jsonObject
export class ChainAssets {
	// Asset origin -> asset.
	//
	// eNFT auf ETH
	// Tokens auf Substrate
	//
	// eNFT origin: Ethereum
	// eNFT was bridged -> eNFT an meinen Account
	//
	// Steht jetzt aber in den ChainAssets, die unterschrieben für substrate.
	//
	// Obwohl immernoch ein NFT auf Ethereum, kann das gegenüber substrate
	// contract bewiesen werden.
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

	addAsset(chain: Chain, token: string, asset: Asset) {
		if (asset instanceof Amount) {
			this.assets.get(chain)?.fungibles.addAsset(token, asset);
		}
	}

	cmp(other: ChainAssets): boolean {
		throw new Error("Method not implemented.");
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

	addAsset(token: string, asset: Amount) {
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

@jsonObject
export class Assets {
	public values: Map<string, Asset>;

	constructor(
		...assets: { token: string | Address<Crypto>; asset: Asset }[]
	) {
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
			if (!utils.isAddress(k)) {
				throw new Error(`decoding asset with malformed address: ${k}`);
			}
			// Make sure addresses are lowercase keys and not checksum encoded.
			vs.values.set(addressKey(k), Asset.fromJSON(data[k]));
		}
		return vs;
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

	hasAsset(addr: string | Address<Crypto>): boolean {
		return this.values.has(addressKey(addr));
	}

	addAssets(assets: Assets): void {
		const it = assets.values.entries();
		for (let next = it.next(); !next.done; next = it.next()) {
			const [k, v] = next.value;
			this.addAsset(k, v);
		}
	}

	addAsset(addr: string | Address<Crypto>, asset: Asset): void {
		addr = addressKey(addr);
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

export async function decodePackedAssets(
	erdstall: Erdstall,
	tokenProvider: Pick<TokenProvider<Backend>, "tokenTypeOf">,
	values: Erdstall.TokenValueStructOutput[],
): Promise<ChainAssets> {
	// TODO: Implement me.
	throw new Error("not implemented");
	// const assets = new Assets();
	// for (const [t, v] of values) {
	// 	const ttype = await tokenProvider.tokenTypeOf(erdstall, t);
	// 	assets.addAsset(t, decodePackedAsset(v, ttype));
	// }
	// return assets;
}

function decodePackedAsset(data: string, ttype: TokenType): Asset {
	switch (ttype) {
		case "ETH": {
			return decodePackedAmount(data);
		}
		case "ERC20": {
			return decodePackedAmount(data);
		}
		case "ERC721": {
			const res = decodePackedIds(data);
			return new Tokens(res);
		}
	}
}

customJSON(Assets);
