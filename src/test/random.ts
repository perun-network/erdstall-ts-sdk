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
	console.log(`PRNG with SEED: ${seed}`);
	return aleaRNGFactory(seed);
}
