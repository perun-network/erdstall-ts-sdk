// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "#erdstall/test/random";
import { Amount } from "#erdstall/ledger/assets";
import { NewUint256 } from "#erdstall/test";

export function NewRandomAmount(rng: PRNG) {
	return new Amount(NewUint256(rng));
}
