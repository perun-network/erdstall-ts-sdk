// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "#erdstall/test/random";
import { NewRandomAddress, NewRandomAssets, NewUint64 } from "#erdstall/test";
import {
	Mint,
	Transfer,
	Burn,
	ExitRequest,
	Transaction,
	TradeOffer,
	Trade,
} from "#erdstall/api/transactions";

export function NewRandomMint(rng: PRNG): Mint {
	return new Mint(
		NewRandomAddress(rng),
		NewUint64(rng),
		NewRandomAddress(rng),
		NewUint64(rng),
	);
}

export function NewRandomTransfer(rng: PRNG, size: number = 1): Transfer {
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

// Returns an unsigned random TradeOffer.
export function newRandomTradeOffer(rng: PRNG, size: number = 1): TradeOffer {
	return new TradeOffer(
		NewRandomAddress(rng),
		NewRandomAssets(rng, size),
		NewRandomAssets(rng, size),
	);
}

// Returns an unsigned random Trade with an unsigned random TradeOffer.
export function newRandomTrade(rng: PRNG, size: number = 1, offer?: TradeOffer): Trade {
	if (offer === undefined) {
		offer = newRandomTradeOffer(rng, size);
	}
	return new Trade(
		NewRandomAddress(rng),
		NewUint64(rng),
		offer
	);
}

export function NewRandomBurn(rng: PRNG, size: number = 1): Burn {
	return new Burn(
		NewRandomAddress(rng),
		NewUint64(rng),
		NewRandomAssets(rng, size),
	);
}

export function NewRandomTransaction(rng: PRNG, size: number = 1): Transaction {
	const calls = [
		(): Transaction => NewRandomMint(rng),
		(): Transaction => NewRandomTransfer(rng, size),
		(): Transaction => NewRandomExitRequest(rng),
		(): Transaction => NewRandomBurn(rng),
	];
	return calls[Math.round((calls.length - 1) * rng.uFloat32())]();
}
