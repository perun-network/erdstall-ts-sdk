// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "#erdstall/test/random";
import { Amount } from "#erdstall/ledger/assets";
import { newRandomUint256 } from "#erdstall/test";

export function newRandomAmount(rng: PRNG) {
	return new Amount(newRandomUint256(rng));
}
