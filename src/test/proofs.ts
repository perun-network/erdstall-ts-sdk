// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG, { newRandomUint8Array } from "./random";
import { Balance, BalanceProof, BalanceProofs } from "#erdstall/api/responses";
import { newRandomUint64 } from "./bigint";
import { newRandomAddress } from "./address";
import { newRandomChainAssets } from "./assets";
import { EthereumSignature } from "#erdstall/ledger/backend/ethereum";

export function newRandomBalance(rng: PRNG, size: number): Balance {
	return new Balance(
		newRandomUint64(rng),
		newRandomAddress(rng),
		false,
		newRandomChainAssets(rng, size),
	);
}

export function newRandomBalanceProofs(
	rng: PRNG,
	assetSize: number,
	size: number,
): BalanceProofs {
	return newRandomProofs(rng, newRandomBalanceProof, assetSize, size);
}

export function newRandomExitProofs(
	rng: PRNG,
	assetSize: number,
	size: number,
): BalanceProofs {
	return newRandomProofs(rng, newRandomExitProof, assetSize, size);
}

function newRandomProofs(
	rng: PRNG,
	proofConstructor: (rng: PRNG, size: number) => BalanceProof,
	assetSize: number,
	size: number,
): BalanceProofs {
	const bps = new BalanceProofs();
	for (let i = 0; i < size; i++) {
		bps.map.set(
			newRandomAddress(rng).toString(),
			proofConstructor(rng, assetSize),
		);
	}
	return bps;
}

export function newRandomBalanceProof(rng: PRNG, size: number): BalanceProof {
	return new BalanceProof(
		newRandomBalance(rng, size),
		new EthereumSignature(
			newRandomUint8Array(rng, 32),
			newRandomAddress(rng),
		),
	);
}

export function newRandomExitProof(rng: PRNG, size: number): BalanceProof {
	const bp = newRandomBalanceProof(rng, size);
	bp.balance.exit = true;
	return bp;
}
