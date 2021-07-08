// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "./random";
import { Signature } from "#erdstall/api";
import { Balance, BalanceProof, BalanceProofs } from "#erdstall/api/responses";
import { NewUint64 } from "./bigint";
import { NewRandomAddress, NewRandomUint8Array } from "./address";
import { NewRandomAssets } from "./assets";

export function NewRandomBalance(rng: PRNG, size: number): Balance {
	return new Balance(
		NewUint64(rng),
		NewRandomAddress(rng),
		false,
		NewRandomAssets(rng, size),
	);
}

export function NewRandomBalanceProofs(
	rng: PRNG,
	assetSize: number,
	size: number,
): BalanceProofs {
	return NewRandomProofs(rng, NewRandomBalanceProof, assetSize, size);
}

export function NewRandomExitProofs(
	rng: PRNG,
	assetSize: number,
	size: number,
): BalanceProofs {
	return NewRandomProofs(rng, NewRandomExitProof, assetSize, size);
}

function NewRandomProofs(
	rng: PRNG,
	proofConstructor: (rng: PRNG, size: number) => BalanceProof,
	assetSize: number,
	size: number,
): BalanceProofs {
	const bps = new BalanceProofs();
	for (let i = 0; i < size; i++) {
		bps.map.set(
			NewRandomAddress(rng).toString(),
			proofConstructor(rng, assetSize),
		);
	}
	return bps;
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
