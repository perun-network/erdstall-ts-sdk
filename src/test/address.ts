// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address } from "ledger/address";
import PRNG from "./random";

export function NewRandomAddress(rng: PRNG): Address {
	return new Address(NewRandomUint8Array(rng, 20));
}

export function NewRandomUint8Array(rng: PRNG, size: number): Uint8Array {
	const arr = new Uint8Array(size).fill(0).map((_, __, ___) => {
		return Math.floor(rng.uFloat32() * 255);
	});
	return arr;
}
