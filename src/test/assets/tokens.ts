// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "../random";
import { Tokens } from "#erdstall/ledger/assets";
import { NewUint256 } from "../bigint";

// NewRandomTokens creates a Tokens type with `size` random unique ids.
export function NewRandomTokens(rng: PRNG, size: number): Tokens {
	let ids = new Array<bigint>(size).fill(0n).map(() => {
		return NewUint256(rng);
	});
	return new Tokens(ids);
}
