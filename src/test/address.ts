// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address } from "#erdstall/ledger";
import PRNG, { newRandomUint8Array } from "./random";

export function newRandomAddress(rng: PRNG): Address {
	return new Address(newRandomUint8Array(rng, 20));
}
