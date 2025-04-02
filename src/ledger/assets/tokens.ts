// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";
import {
	Asset,
	TypeTags,
	TypeTagName,
	assertSubtractable,
	ErrIncompatibleAssets,
	registerAssetType,
} from "./asset";
import { Amount } from "./amount";
import { bigTo0xEven } from "#erdstall/export/typedjson";
import { AssetType } from "#erdstall/crypto";

export const ErrIDAlreadyContained = new Error(
	"given ID already contained in tokens",
);

export class Tokens extends Asset {
	public value: bigint[];

	assetType(): AssetType.NFT { return AssetType.NFT; }

	constructor(v: bigint[]) {
		super();
		this.value = v.sort((a, b) => (a < b ? -1 : a == b ? 0 : 1));

		// validate that all fields are positive and do not have duplicates.
		for (let k = 0; k < this.value.length - 1; k++) {
			if (this.value[k] < 0n) throw new Error("invalid token id in token set");
			if (this.value[k] === v[k + 1]) throw new Error("token entries not unique");
		}
	}

	toJSON() {
		return this.value.map((val) => bigTo0xEven(val));
	}

	static fromJSON(idset: string[]): Tokens {
		const s = new Array<bigint>(idset.length);
		for (const i in idset)
			s[i] = BigInt(idset[i]);
		return new Tokens(s);
	}

	toString() { return "[" + this.value.join(", ") + "]"; }

	typeTag(): TypeTagName { return TypeTags.Tokens; }

	zero(): boolean
		{ return this.value.length === 0; }

	clone(): this {
		let t = new Tokens([]);
		t.value = Array.from(this.value);
		return t as this;
	}

	cmp(asset: this): -1 | 0 | 1 | undefined {
		if(!(asset instanceof Tokens))
			throw new Error("Type error: expected Tokens");

		const lhs = this.value;
		const rhs = asset.value;
		const min = lhs.length < rhs.length ? lhs : rhs;
		const max = lhs.length < rhs.length ? rhs : lhs;
		const minsz = lhs.length;
		const maxsz = rhs.length;
		const flip_sign = lhs.length < rhs.length ? 1 : -1;

		let bigger = false;
		let smaller = false;

		let min_i = 0, max_i = 0;
		for (; min_i !== minsz && max_i !== maxsz;) {
			let sign = min[min_i] - max[max_i];
			if(sign < 0n)
			{
                // we had a smaller NFT ID in min that is not in max.
				bigger = true;
				min_i++;
			}
			else if(sign > 0n)
			{
                // we had a smaller NFT ID in max that is not in min.
                smaller = true;
                max_i++;
			} else
			{
				// both have the same token.
				++min_i;
				++max_i;
			}

			if(bigger && smaller) break;
		}
		if(minsz !== maxsz)
			smaller = true;
		if (bigger && smaller) return undefined;

		return (smaller ? -flip_sign : bigger ? flip_sign : 0) as any;
	}

	#sub(asset: this): bigint[] | undefined
	{
		if(asset.value.length > this.value.length) return undefined;

		let ret = new Array<bigint>(this.value.length - asset.value.length);

		let ret_i = 0;
		let this_i = 0;
		let asset_i = 0;

		for(; this_i !== this.value.length && asset_i !== asset.value.length;)
		{
			let sign = this.value[this_i] - asset.value[asset_i];
			if(sign < 0n)
			{
				// we have an NFT ID that comes before the one to subtract.
				ret[ret_i++] = this.value[this_i++];
			} else if(sign > 0n)
			{
				// we tried to subtract an NFT ID that was not present.
				return undefined;
			} else {
				// we have the NFT ID we were trying to subtract: OK.
				++this_i;
				++asset_i;
			}
		}

		// not all NFT IDs to remove were removed?
		if(asset_i !== asset.value.length)
			return undefined;

		// add all remaining NFT IDs.
		while(this_i !== this.value.length)
			ret[ret_i++] = this.value[this_i++];

		return ret;
	}

	// Implements the -= operator for NFT collections. Throws on absent tokens.
	sub(asset: this): void {
		let ret = this.#sub(asset);
		if(ret === undefined)
			throw new Error("Subtracting NFT collections: token not present.");
		this.value = ret;
	}

	// The non-modifying - operator for NFT collections. Throws on duplicate tokens.
	static sub(lhs: Tokens, rhs: Tokens): Tokens {
		let value = lhs.#sub(rhs);
		if(value === undefined)
			throw new Error("Subtracting NFT collections: token not present.");
		const ret = new Tokens([]);
		ret.value = value;
		return ret;
	}

	// Non-throwing, non-modifying - operator for NFT collections. Returns undefined on duplicate tokens.
	static sub_nothrow(lhs: Tokens, rhs: Tokens): Tokens | undefined {
		let value = lhs.#sub(rhs);
		if(value === undefined)
			return undefined;
		const ret = new Tokens([]);
		ret.value = value;
		return ret;
	}

	#add(asset: this): bigint[] | undefined
	{
		if (!this.isCompatible(asset)) {
			throw ErrIncompatibleAssets;
		}

		let ret = new Array<bigint>(this.value.length + asset.value.length);

		let ret_i = 0;
		let this_i = 0;
		let asset_i = 0;
		// interleave/zipper both NFT ID arrays.
		for(; this_i !== this.value.length && asset_i !== asset.value.length;)
		{
			let sign = this.value[this_i] - asset.value[asset_i];
			if(sign < 0n)
			{
				ret[ret_i++] = this.value[this_i++];
			} else if(sign > 0n)
			{
				ret[ret_i++] = asset.value[asset_i++];
			} else {
				return undefined;
			}
		}

		// add the rest of the longer array.
		while(this_i !== this.value.length)
			ret[ret_i++] = this.value[this_i++];

		while(asset_i !== asset.value.length)
			ret[ret_i++] = asset.value[asset_i++];

		return ret;
	}

	// Implements the += operator for NFT collections. Throws on duplicate tokens.
	add(asset: this): void {
		let ret = this.#add(asset);
		if(ret === undefined)
			throw new Error("Adding two NFT collections: duplicate token encountered.");
		this.value = ret;
	}

	// The non-modifying + operator for NFT collections. Throws on duplicate tokens.
	static add(lhs: Tokens, rhs: Tokens): Tokens {
		let value = lhs.#add(rhs);
		if(value === undefined)
			throw new Error("Adding two NFT collections: duplicate token encountered.");
		const ret = new Tokens([]);
		ret.value = value;
		return ret;
	}

	// Non-throwing, non-modifying + operator for NFT collections. Returns undefined on duplicate tokens.
	static add_nothrow(lhs: Tokens, rhs: Tokens): Tokens | undefined {
		let value = lhs.#add(rhs);
		if(value === undefined)
			return undefined;
		const ret = new Tokens([]);
		ret.value = value;
		return ret;
	}

	addID(id: bigint): void {
		let targetPos = -1;
		this.value.forEach((v, i) => {
			if (v === id) {
				throw ErrIDAlreadyContained;
			}
			if (v < id) {
				targetPos = i;
			}
		});
		this.value.splice(targetPos + 1, 0, id);
	}
}

registerAssetType(TypeTags.Tokens, Tokens.fromJSON);

export function mapNFTs<T>(
	a: Map<string, Asset>,
	f: (token: string, id: bigint) => T,
): T[] {
	return Array.from(a, ([token, asset]) => {
		if (asset instanceof Tokens) {
			return asset.value.map((id) => f(token, id));
		} else {
			return [];
		}
	}).flat();
}
