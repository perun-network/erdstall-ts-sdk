// SPDX-License-Identifier: Apache-2.0
"use strict";

import { BigNumber, utils } from "ethers";

import {
	Asset,
	TypeTags,
	TypeTagName,
	ErrIncompatibleAssets,
	assertUint256,
	registerAssetType,
} from "./asset";
import { mkBigInt } from "#erdstall/utils/bigint";

/** Amount represents a currency amount in its smallest unit. */
export class Amount extends Asset {
	public value: bigint;

	constructor(v: bigint) {
		super();
		assertUint256(v);
		this.value = v;
	}

	toJSON() {
		return utils.hexValue(BigNumber.from(this.value));
	}

	static fromJSON(hexString: string): Amount {
		return new Amount(BigInt(hexString));
	}

	typeTag(): TypeTagName {
		return TypeTags.Amount;
	}

	asABI(): Uint8Array {
		const arr = ethers.getBytes(BigNumber.from(this.value));
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
		assertUint256(res);

		this.value = res;
	}

	add(asset: Asset): void {
		if (!this.isCompatible(asset)) {
			throw ErrIncompatibleAssets;
		}

		const res = this.value + (asset as Amount).value;
		assertUint256(res);

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

export function encodePackedAmount(value: bigint): string {
	return utils.defaultAbiCoder.encode(["uint256"], [value]);
}

export function decodePackedAmount(data: string): Amount {
	let idArr: Uint8Array;
	if (!data.startsWith("0x")) {
		idArr = ethers.getBytes(`0x${data}`);
	} else {
		idArr = ethers.getBytes(data);
	}
	return new Amount(mkBigInt(idArr.values(), 256, 8));
}

registerAssetType(TypeTags.Amount, Amount.fromJSON);
