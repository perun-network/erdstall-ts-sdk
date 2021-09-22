// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "#erdstall/test/random";
import { Tokens } from "#erdstall/ledger/assets";
import { newRandomUint256 } from "#erdstall/test";

// newRandomTokens creates a Tokens type with `size` random unique ids.
export function newRandomTokens(rng: PRNG, size: number): Tokens {
	let ids = new Array<bigint>(size).fill(0n).map(() => {
		return newRandomUint256(rng);
	});
	return new Tokens(ids);
}
