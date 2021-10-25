// SPDX-License-Identifier: Apache-2.0
"use strict";

import { mkBigInt } from "#erdstall/utils";
import PRNG from "./random";

// newRandomBigInt generates a random `BigInt` with max. `maxBits` number of
// bits.
export function newRandomBigInt(rng: PRNG, maxBits: number): bigint {
	return mkBigInt(rng.valuesUInt32(), maxBits, 32);
}

// NewUint256 generates a random bigint with 256 bit precision.
export function newRandomUint256(rng: PRNG): bigint {
	return newRandomBigInt(rng, 256);
}

// NewUint64 generates a random bigint with 64 bit precision.
export function newRandomUint64(rng: PRNG): bigint {
	return newRandomBigInt(rng, 64);
}
