// SPDX-License-Identifier: Apache-2.0

import assert from "assert";

import { newPrng } from "./random";
import { newRandomBigInt } from "./bigint";

const NUM_TRIES = 128;

describe("newRandomBigInt", function () {
	const rng = newPrng();

	function itShouldGenerateProperSize(bits: number) {
		it(`shold generate numbers of correct size ${bits}`, function () {
			let maxSizeSeen = false;
			for (let i = 0; i < NUM_TRIES; i++) {
				const x = newRandomBigInt(rng, bits);
				assert.ok(
					x < 1n << BigInt(bits),
					`${x} has more than ${bits} bits`,
				);
				maxSizeSeen ||= x >> (BigInt(bits) - 1n) > 0n;
			}
			// It is very unlikely (1 : 2**NUM_TRIES) that all generated numbers have
			// the most significant bit _not_ set.
			assert.ok(
				maxSizeSeen,
				`always less than ${bits} bits after ${NUM_TRIES} tries`,
			);
		});
	}

	for (const i of [1, 7, 8, 9, 31, 32, 33, 255, 256, 257]) {
		itShouldGenerateProperSize(i);
	}
});
