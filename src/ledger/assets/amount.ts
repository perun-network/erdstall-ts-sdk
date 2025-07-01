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
	_assetDecoders
} from "./asset";
import { AssetType } from "#erdstall/crypto";
import { bigTo0xEven } from "#erdstall/export/typedjson";
import { CodecReader, CodecWriter } from "#erdstall/utils";

/** Amount represents a currency amount in its smallest unit. */
export class Amount extends Asset {
	public value: bigint;

	constructor(v: bigint) {
		super();
		assertUint256(v);
		this.value = v;
	}

	override assetType(): AssetType.Fungible { return AssetType.Fungible; }

	override toJSON() {
		return bigTo0xEven(this.value);
	}

	static fromJSON(hexString: string): Amount {
		return new Amount(BigInt(hexString));
	}

	static decode(r: CodecReader): Amount { return new Amount(r.u256()); }
	encode(w: CodecWriter): void { w.u256(this.value); }

	override toString() { return this.value.toString(); }

	override typeTag(): TypeTagName {
		return TypeTags.Amount;
	}

	zero(): boolean {
		return this.value === 0n;
	}

	override clone(): this
		{ return new Amount(this.value) as this; }

	sub(asset: this): void {
		if (!this.isCompatible(asset)) {
			throw ErrIncompatibleAssets;
		}

		const res = this.value - (asset as Amount).value;
		assertUint256(res);

		this.value = res;
	}

	add(asset: this): void {
		if (!this.isCompatible(asset)) {
			throw ErrIncompatibleAssets;
		}

		const res = this.value + (asset as Amount).value;
		assertUint256(res);

		this.value = res;
	}

	cmp(asset: this): -1 | 0 | 1 {
		const x = this.value;
		const y = (asset as Amount).value;
		if (x < y) {
			return -1;
		} else if (x > y) {
			return 1;
		} else {
			return 0;
		}
	}
}

registerAssetType(TypeTags.Amount, Amount.fromJSON);
_assetDecoders.set(AssetType.Fungible, Amount.decode);
