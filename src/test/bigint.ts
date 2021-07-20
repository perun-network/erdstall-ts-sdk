// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "#erdstall/test/random";

// NewBigInt generates a random `BigInt` in range 0 <= `CEIL`.
export function NewBigInt(rng: PRNG, CEIL: bigint): bigint {
	const base = CEIL / 2n;
	const offset = (BigInt(Math.floor(100 * rng.uFloat32())) * base) / 100n;
	const add = (v1: bigint, v2: bigint): bigint => {
		return v1 + v2;
	};
	const sub = (v1: bigint, v2: bigint): bigint => {
		return v1 - v2;
	};
	const op = rng.uFloat32() < 0.5 ? add : sub;
	return op(base, offset);
}

// NewUint256 generates a random bigint with 256 bit precision.
export function NewUint256(rng: PRNG): bigint {
	return BigInt.asUintN(256, NewBigInt(rng, 2n ** 256n));
}

// NewUint64 generates a random bigint with 64 bit precision.
export function NewUint64(rng: PRNG): bigint {
	return BigInt.asUintN(64, NewBigInt(rng, 2n ** 64n));
}
