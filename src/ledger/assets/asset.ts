// SPDX-License-Identifier: Apache-2.0
"use strict";

import { isUint256 } from "#erdstall/api/util";

export const TypeTags = {
	Amount: "uint",
	Tokens: "idset",
} as const;

type _typeTags = typeof TypeTags;
export type TypeTagName = _typeTags[keyof _typeTags];

export const ErrUncomparableAssets = new Error("uncomparable assets");
export const ErrSubtrahendLargerThanMinuend = new Error(
	"subtrahend larger than minuend",
);
export const ErrIncompatibleAssets = new Error("incompatible assets");
export const ErrValueOutOfBounds = new Error("value is not a uint256");

const assetImpls = new Map<string, (value: any) => Asset>();

export function registerAssetType(
	typeTag: TypeTagName,
	valueParser: (value: any) => Asset,
) {
	assetImpls.set(typeTag, valueParser);
}

export abstract class Asset {
	abstract toJSON(): any;

	static fromJSON(json: any): Asset {
		for (const key in json) {
			if (assetImpls.has(key)) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				return assetImpls.get(key)!(json[key]);
			}
			throw new Error(
				`Asset.fromJSON: invalid key ${key}, obj=${JSON.stringify(
					json,
				)}`,
			);
		}

		throw new Error(
			`empty object is not a valid Asset encoding: ${JSON.stringify(
				json,
			)}`,
		);
	}

	abstract typeTag(): TypeTagName;

	// isCompatible returns whether the assets are of the same type and are thus
	// compatible in Add, Sub and Cmp.
	isCompatible(asset: Asset): boolean {
		return this.typeTag() === asset.typeTag();
	}

	// clone returns a clone of the asset.
	abstract clone(): Asset;

	// add adds the passed asset to the called-on asset and returns itself. The
	// value is modified in-place.
	//
	// add throws an error if the assets are not compatible.
	abstract add(asset: Asset): void;

	// sub removes the passed asset from the called-on asset. The asset is
	// modified in-place.
	//
	// A non-nil error is returned if the asset cannot be removed, e.g. if a
	// asset would become negative or an NFT would be removed that is not
	// contained in the original asset.
	//
	// sub throws an error if the assets are not compatible.
	abstract sub(asset: Asset): void;

	// cmp compares the two assets. It returns the comparison result and whether
	// the assets are comparable.
	//
	// The first value of x.Cmp(y) is
	//    -1 if x <  y
	//     0 if x == y
	//     1 if x >  y
	// where the meaning of <, > and == depends on the specific value type.
	abstract cmp(asset: Asset): "lt" | "eq" | "gt" | "uncomparable";

	// zero returns true if the asset is zero, e.g., it is 0 or the empty
	// set.
	abstract zero(): boolean;
}

// assertSubtractable asserts that the two given values are substractable. It
// throws an error if this is not the case.
export function assertSubtractable(minuend: Asset, subtrahend: Asset): void {
	const res = minuend.cmp(subtrahend);
	if (res === "uncomparable") {
		throw ErrUncomparableAssets;
	} else if (res === "lt") {
		throw ErrSubtrahendLargerThanMinuend;
	}
}

// assertUint256 asserts, that the given value is in range [0, 2^256-1].
export function assertUint256(val: bigint): void {
	if (!isUint256(val)) {
		throw ErrValueOutOfBounds;
	}
}
