// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Account } from "#erdstall/ledger";
import PRNG from "#erdstall/test/random";
import { NewUint64 } from "#erdstall/test/bigint";
import { NewRandomAssets } from "#erdstall/test/assets";

export function NewRandomAccount(rng: PRNG, size: number): Account {
	return new Account(
		NewUint64(rng),
		NewRandomAssets(rng, size),
		NewRandomAssets(rng, size),
	);
}
