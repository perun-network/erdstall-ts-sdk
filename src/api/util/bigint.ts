// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Option, none, some } from "fp-ts/lib/Option";

// `Prettier` has no option to ignore mathexpressions and contrary to whatever
// `Prettier` is deducing, the statement:
//
//        `(1n << 256n) - 1n` == `1n << 256n - 1n`
//
//  is NOT true...
//
//  This seems to be fixed in the newest release of `Prettier`, but we will
//  keep the `prettier-ignore` line here to be 100% sure it does not get
//  formatted on accident.

// prettier-ignore
export const MAX_UINT256 = (1n << 256n) - 1n;

export type Uint256 = bigint;

export function isUint256(value: bigint): value is Uint256 {
	return value >= 0 && value <= MAX_UINT256;
}

export function mkUint256(value: bigint): Option<Uint256> {
	return isUint256(value) ? some(value) : none;
}
