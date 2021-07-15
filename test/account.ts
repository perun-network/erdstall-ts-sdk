// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Account } from "../src/ledger";
import PRNG from "./random";
import { NewUint64 } from "./bigint";
import { NewRandomAssets } from "./assets";

export function NewRandomAccount(rng: PRNG, size: number): Account {
	return new Account(
		NewUint64(rng),
		NewRandomAssets(rng, size),
		NewRandomAssets(rng, size),
	);
}
