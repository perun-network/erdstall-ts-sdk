// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "../random";
import {
	Mint,
	Transfer,
	ExitRequest,
	Transaction,
} from "api/transactions";
import { NewRandomAddress } from "../address";
import { NewRandomAssets } from "../assets/assets";
import { NewUint64 } from "../bigint";

export function NewRandomMint(rng: PRNG): Mint {
	return new Mint(
		NewRandomAddress(rng),
		NewUint64(rng),
		NewRandomAddress(rng),
		NewUint64(rng),
	);
}

export function NewRandomTransfer(rng: PRNG, size: number): Transfer {
	return new Transfer(
		NewRandomAddress(rng),
		NewUint64(rng),
		NewRandomAddress(rng),
		NewRandomAssets(rng, size),
	);
}

export function NewRandomExitRequest(rng: PRNG): ExitRequest {
	return new ExitRequest(NewRandomAddress(rng), NewUint64(rng));
}

export function NewRandomTransaction(rng: PRNG, size: number): Transaction {
	const calls = [
		(): Transaction => NewRandomMint(rng),
		(): Transaction => NewRandomTransfer(rng, size),
		(): Transaction => NewRandomExitRequest(rng),
	];
	return calls[(calls.length - 1) * rng.uFloat32()]();
}
