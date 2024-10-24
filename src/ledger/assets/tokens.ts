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
		Tokens.requireUniquePositiveEntries(this.value);
	}

	// requireUniquePositiveEntries expects `v` to be sorted and asserts that every
	// entry in `v` is unique and a positive `bigint`. If the invariant does not
	// hold, an error is thrown.
	private static requireUniquePositiveEntries(v: bigint[]) {
		for (let k = 0; k < v.length - 1; k++) {
			if (v[k] < 0n) throw new Error("invalid token id in token set");
			if (v[k] === v[k + 1]) throw new Error("token entries not unique");
		}
	}

	toJSON() {
		return this.value.map((val) => bigTo0xEven(val));
	}

	static fromJSON(idset: string[]): Tokens {
		const s = new Array<bigint>();
		for (const id in idset) {
			s.push(BigInt(idset[id]));
		}
		return new Tokens(s);
	}

	toString() { return "[" + this.value.join(", ") + "]"; }

	typeTag(): TypeTagName {
		return TypeTags.Tokens;
	}

	zero(): boolean {
		return this.value.length === 0;
	}

	clone(): Asset {
		const identity = <T>(v: T): T => {
			return v;
		};
		return new Tokens(this.value.map(identity));
	}

	cmp(asset: Asset): "lt" | "eq" | "gt" | "uncomparable" {
		if (!this.isCompatible(asset)) {
			return "uncomparable";
		}
		let res = ["lt", "eq", "gt"] as const;
		let a = this.value;
		let b = (asset as Tokens).value;
		let cmp = 0;
		let swap = 1;
		if (b.length > a.length) {
			const t = a;
			a = b;
			b = t;
			swap = -1;
		}

		let bIdx = 0;
		for (let i = 0; i < a.length && bIdx < b.length; i++) {
			if (a[i] == b[bIdx]) ++bIdx;
			else if (a[i] > b[bIdx]) break; // short circuit.
		}

		if (bIdx !== b.length) return "uncomparable";

		if (a.length > b.length) {
			cmp = 1;
		}

		return res[cmp * swap + 1];
	}

	sub(asset: Asset): void {
		assertSubtractable(this, asset);

		let fillIdx = 0;
		let aIdx = 0;
		let bIdx = 0;
		let a = this.value;
		let b = (asset as Tokens).value;
		for (; aIdx < this.value.length && bIdx < b.length; aIdx++) {
			const x = this.value[aIdx];
			const y = b[bIdx];
			if (x !== y) {
				a[fillIdx] = x;
				fillIdx++;
			} else {
				bIdx++;
			}
		}

		let newLengthA = fillIdx;
		if (aIdx < this.value.length) {
			newLengthA = this.fillWithRemainders(a, fillIdx, aIdx);
		}

		a.splice(newLengthA);
		this.value = a;
	}

	// fillWithRemainders fills the given array `a` with the elements of `a`
	// starting from pos `from`, inserting them starting from pos `insertAt`.
	// It returns the length of the filled array.
	// It is assumed that `insertAt` < `from` holds.
	private fillWithRemainders<T>(
		a: Array<T>,
		insertAt: number,
		from: number,
	): number {
		for (; from < a.length; from++, insertAt++) {
			a[insertAt] = a[from];
		}
		return insertAt;
	}

	add(asset: Asset): void {
		if (!this.isCompatible(asset)) {
			throw ErrIncompatibleAssets;
		}
		(asset as Tokens).value.forEach(this.addID, this);
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
			0;
		});
		if (targetPos === -1) {
			return this.insertAt(0, id);
		}
		// We found the last element smaller than our `id`, so we want to insert
		// the new `id` after the found one.
		this.insertAt(targetPos + 1, id);
	}

	private insertAt(pos: number, id: bigint): void {
		this.value = this.value
			.slice(0, pos)
			.concat([id], this.value.splice(pos));
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
