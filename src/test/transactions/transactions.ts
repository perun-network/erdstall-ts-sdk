// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG, { newRandomUint8Array } from "#erdstall/test/random";
import {
	newRandomAddress,
	newRandomAssets,
	newRandomChainAssets,
	newRandomUint64,
} from "#erdstall/test";
import {
	Mint,
	Transfer,
	Burn,
	ExitRequest,
	Transaction,
	TradeOffer,
	Trade,
} from "#erdstall/api/transactions";

export function newRandomMint(rng: PRNG): Mint {
	return new Mint(
		newRandomAddress(rng),
		newRandomUint64(rng),
		newRandomUint8Array(rng, 32),
		newRandomUint64(rng),
	);
}

export function newRandomTransfer(rng: PRNG, size: number = 1): Transfer {
	return new Transfer(
		newRandomAddress(rng),
		newRandomUint64(rng),
		newRandomAddress(rng),
		newRandomChainAssets(rng, size),
	);
}

export function newRandomExitRequest(rng: PRNG): ExitRequest {
	return new ExitRequest(
		newRandomAddress(rng),
		newRandomUint64(rng),
		rng.uInt32() % 2 === 0,
	);
}

// Returns an unsigned random TradeOffer.
export function newRandomTradeOffer(rng: PRNG, size: number = 1): TradeOffer {
	return new TradeOffer(
		newRandomAddress(rng),
		newRandomChainAssets(rng, size),
		newRandomChainAssets(rng, size),
	);
}

// Returns an unsigned random Trade with an unsigned random TradeOffer.
export function newRandomTrade(
	rng: PRNG,
	size: number = 1,
	offer?: TradeOffer,
): Trade {
	if (offer === undefined) {
		offer = newRandomTradeOffer(rng, size);
	}
	return new Trade(newRandomAddress(rng), newRandomUint64(rng), offer);
}

export function newRandomBurn(rng: PRNG, size: number = 1): Burn {
	return new Burn(
		newRandomAddress(rng),
		newRandomUint64(rng),
		newRandomChainAssets(rng, size),
	);
}

export function newRandomTransaction(rng: PRNG, size: number = 1): Transaction {
	const calls = [
		(): Transaction => newRandomMint(rng),
		(): Transaction => newRandomTransfer(rng, size),
		(): Transaction => newRandomExitRequest(rng),
		(): Transaction => newRandomBurn(rng),
	];
	return calls[Math.round((calls.length - 1) * rng.uFloat32())]();
}
