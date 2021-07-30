// SPDX-License-Identifier: Apache-2.0
"use strict";

import { aleaRNGFactory } from "number-generator";

export default interface PRNG {
	uFloat32: () => number;
	uInt32: () => number;
}

// NewPrng returns a PRNG seeded with the current `date-time`.
export function NewPrng(): PRNG {
	let seed = Number(process.env.ESSEED);
	if (!seed) {
		seed = new Date().getTime();
	}
	console.log(`PRNG with ESSEED=${seed}`);
	return aleaRNGFactory(seed);
}

export function NewRandomUint8Array(rng: PRNG, size: number): Uint8Array {
	const arr = new Uint8Array(size).fill(0).map((_, __, ___) => {
		return rng.uInt32() % 0xff;
	});
	return arr;
}
