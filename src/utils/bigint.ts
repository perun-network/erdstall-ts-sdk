// SPDX-License-Identifier: Apache-2.0
"use strict";

// mkBigInt uses the numbers given by `gen` to create a `bigint` value. When
// using a `Uint8Array.values()` as a generator source, the data is expected to
// be in BIGENDIAN format.
export function mkBigInt(
	gen: Iterator<number>,
	maxBits: number, // Maximum bits the resulting `bigint` should be of.
	intSize: 8 | 16 | 32, // Bitwidth of input `number` from G.next().
): bigint {
	const numInts = Math.trunc(maxBits / intSize);
	let x = 0n;
	let genVal = gen.next();
	// Fill from left to right first in case we convert from a bigendian array.
	for (let i = numInts - 1; !genVal.done && i >= 0; --i) {
		x += BigInt(genVal.value) << BigInt(i * intSize);
		genVal = gen.next();
	}
	const restBits = maxBits % intSize;
	if (restBits > 0) {
		// Shift by remaining bits to have properly sized bigints as required by maxBits.
		x = x << BigInt(restBits);
	}
	if (maxBits < intSize) {
		// No value from `genVal` was read yet and the result is smaller than the
		// value from the generator.
		x += BigInt(genVal.value & ((1 << maxBits) - 1));
	} else if (restBits > 0 && !genVal.done) {
		x += BigInt(genVal.value & ((1 << restBits) - 1));
	}
	return x;
}
