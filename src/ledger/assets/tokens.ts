// SPDX-License-Identifier: Apache-2.0
"use strict";

import { BigNumber, utils } from "ethers";
import {
	Asset,
	TypeTags,
	AssertSubtractable,
	ErrIncompatibleAssets,
} from "./asset";
import { BigInteger, ABIEncoder } from "../../api/util";

export const ErrIDAlreadyContained = new Error(
	"given ID already contained in tokens",
);

export class Tokens extends Asset {
	public value: bigint[];

	constructor(v: bigint[]) {
		super();
		this.value = v;
	}

	toJSON() {
		return this.value.map((val) => {
			return utils.hexlify(BigNumber.from(val));
		});
	}

	static fromJSON(idset: string[]): Tokens {
		const s = new Array<bigint>();
		for (const id in idset) {
			s.push(BigInt(idset[id]));
		}
		return new Tokens(s);
	}

	typeTag(): string {
		return TypeTags.Tokens;
	}

	asABI(): any {
		let ids: BigNumber[] = [];
		this.value.forEach((v) => {
			ids.push(new BigInteger(v).asABI());
		});
		return new ABIEncoder(["uint256[]", ids]).pack_noprefix();
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
			a = b;
			b = (asset as Tokens).value;
			swap = -1;
		}

		if (b.length === 0 && b.length !== a.length) {
			cmp = 1;
		}

		let aIdx = 0;
		let bIdx = 0;
		for (; aIdx < a.length && bIdx < b.length; aIdx++) {
			const lhs = a[aIdx];
			const rhs = b[bIdx];
			if (lhs < rhs) {
				cmp = 1;
			} else if (lhs === rhs) {
				bIdx++;
			} else if (lhs > rhs) {
				break;
			}
		}

		if (bIdx !== b.length) {
			return "uncomparable";
		}

		return res[cmp * swap + 1];
	}

	sub(asset: Asset): void {
		AssertSubtractable(this, asset);

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
