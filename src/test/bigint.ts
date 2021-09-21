// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "./random";

// newRandomBigInt generates a random `BigInt` with max. `maxBits` number of
// bits.
export function newRandomBigInt(rng: PRNG, maxBits: number): bigint {
	const numInts = Math.trunc(maxBits / 32);
	let x = 0n;
	for (let i = 0; i < numInts; ++i) {
		x += BigInt(rng.uInt32()) << BigInt(i * 32);
	}
	const restBits = maxBits % 32;
	if (restBits > 0) {
		x +=
			BigInt(rng.uInt32() & ((1 << restBits) - 1)) <<
			BigInt(numInts * 32);
	}
	return x;
}

// NewUint256 generates a random bigint with 256 bit precision.
export function newRandomUint256(rng: PRNG): bigint {
	return newRandomBigInt(rng, 256);
}

// NewUint64 generates a random bigint with 64 bit precision.
export function newRandomUint64(rng: PRNG): bigint {
	return newRandomBigInt(rng, 64);
}
