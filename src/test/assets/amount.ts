// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "../random";
import { Amount } from "#erdstall/ledger/assets";
import { NewUint256 } from "../bigint";

export function NewRandomAmount(rng: PRNG) {
	return new Amount(NewUint256(rng));
}
