// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";

import {
	Asset,
	TypeTags,
	TypeTagName,
	ErrIncompatibleAssets,
	assertUint256,
	registerAssetType,
} from "./asset";
import { AssetType } from "#erdstall/crypto";
import { bigTo0xEven } from "#erdstall/export/typedjson";

/** Amount represents a currency amount in its smallest unit. */
export class Amount extends Asset {
	public value: bigint;

	constructor(v: bigint) {
		super();
		assertUint256(v);
		this.value = v;
	}

	assetType(): AssetType.Fungible { return AssetType.Fungible; }

	toJSON() {
		return bigTo0xEven(this.value);
	}

	static fromJSON(hexString: string): Amount {
		return new Amount(BigInt(hexString));
	}

	toString() { return this.value.toString(); }

	typeTag(): TypeTagName {
		return TypeTags.Amount;
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

registerAssetType(TypeTags.Amount, Amount.fromJSON);
