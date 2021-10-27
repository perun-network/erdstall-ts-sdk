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

		if (!genVal.done) {
			// Fill remaining bits with a value from generator using MSBs.
			const bitDiff = BigInt(intSize) - BigInt(restBits);
			const maxIntOfIntSize = (1n << BigInt(intSize)) - 1n; // 0x1111...
			x += (BigInt(genVal.value) & maxIntOfIntSize) >> bitDiff;
		}
	}
	return x;
}
