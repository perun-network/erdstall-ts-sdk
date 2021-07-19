// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "./random";
import { Signature } from "api";
import { Balance, BalanceProof } from "api/responses";
import { NewUint64 } from "./bigint";
import { NewRandomAddress, NewRandomUint8Array } from "./address";
import { NewRandomAssets } from "./assets/assets";

export function NewRandomBalance(rng: PRNG, size: number): Balance {
	return new Balance(
		NewUint64(rng),
		NewRandomAddress(rng),
		false,
		NewRandomAssets(rng, size),
	);
}

export function NewRandomBalanceProof(rng: PRNG, size: number): BalanceProof {
	return new BalanceProof(
		NewRandomBalance(rng, size),
		new Signature(NewRandomUint8Array(rng, 32)),
	);
}

export function NewRandomExitProof(rng: PRNG, size: number): BalanceProof {
	const bp = NewRandomBalanceProof(rng, size);
	bp.balance.exit = true;
	return bp;
}
