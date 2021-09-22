// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Buffer } from "buffer";
import { aleaRNGFactory } from "number-generator";

export default interface PRNG {
	uFloat32: () => number;
	uInt32: () => number;
}

// NewPrng returns a PRNG seeded with the current `date-time`.
export function newPrng(): PRNG {
	let seed = Number(process.env.ESSEED);
	if (!seed) {
		seed = new Date().getTime();
	}
	console.log(`PRNG with ESSEED=${seed}`);
	return aleaRNGFactory(seed);
}

export function newRandomUint8Array(rng: PRNG, size: number): Uint8Array {
	const arr = new Uint8Array(size).fill(0).map((_, __, ___) => {
		return rng.uInt32() % 0xff;
	});
	return arr;
}

// returns a hex string of given length
export function newRandomString(rng: PRNG, length: number): string {
	const buf = Buffer.allocUnsafe(length / 2);
	for (let i = 0; i < length / 2; i++) {
		buf[i] = rng.uInt32() % 0xff;
	}
	return buf.toString("hex").slice(0, length);
}
