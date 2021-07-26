// SPDX-License-Identifier: Apache-2.0
"use strict";

import { BigNumber, utils } from "ethers";

import { Asset, TypeTags, ErrIncompatibleAssets, AssertUint256 } from "./asset";

/** Amount represents a currency amount in its smallest unit. */
export class Amount extends Asset {
	public value: bigint;

	constructor(v: bigint) {
		super();
		AssertUint256(v);
		this.value = v;
	}

	toJSON() {
		return utils.hexValue(BigNumber.from(this.value));
	}

	static fromJSON(hexString: string): Amount {
		return new Amount(BigInt(hexString));
	}

	typeTag(): string {
		return TypeTags.Amount;
	}

	asABI(): Uint8Array {
		const arr = utils.arrayify(BigNumber.from(this.value));
		const abi = new Uint8Array(32);
		abi.set(arr, 32 - arr.length);
		return abi;
	}

	zero(): boolean {
		return this.value === 0n;
	}

	clone(): Asset {
		return new Amount(BigInt(this.value));
	}

	isCompatible(asset: Asset): boolean {
		return this.typeTag() === asset.typeTag();
	}

	sub(asset: Asset): void {
		if (!this.isCompatible(asset)) {
			throw ErrIncompatibleAssets;
		}

		if (this.cmp(asset) == "lt") {
			throw Error("subtrahend larger than minuend");
		}

		const res = this.value - (asset as Amount).value;
		AssertUint256(res);

		this.value = res;
	}

	add(asset: Asset): void {
		if (!this.isCompatible(asset)) {
			throw ErrIncompatibleAssets;
		}

		const res = this.value + (asset as Amount).value;
		AssertUint256(res);

		this.value = res;
	}

	cmp(asset: Asset): "lt" | "eq" | "gt" | "uncomparable" {
		if (!this.isCompatible(asset)) {
			return "uncomparable";
		}

		const x = this.value;
		const y = (asset as Amount).value;
		if (x < y) {
			return "lt";
		} else if (x > y) {
			return "gt";
		} else {
			return "eq";
		}
	}
}
