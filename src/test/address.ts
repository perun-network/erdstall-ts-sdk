// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address } from "#erdstall/ledger";
import PRNG, { NewRandomUint8Array } from "./random";

export function NewRandomAddress(rng: PRNG): Address {
	return new Address(NewRandomUint8Array(rng, 20));
}
