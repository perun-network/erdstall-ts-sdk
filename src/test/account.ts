// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "./random";
import { Account } from "#erdstall/ledger";
import { newRandomUint64 } from "./bigint";
import { newRandomAssets } from "./assets";

export function newRandomAccount(rng: PRNG, size: number): Account {
	return new Account(
		newRandomUint64(rng),
		newRandomAssets(rng, size),
		newRandomAssets(rng, size),
	);
}
