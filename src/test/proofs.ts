// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG, { newRandomUint8Array } from "./random";
import {
	Balance,
	BalanceProofs,
	ChainProofChunk,
} from "#erdstall/api/responses";
import { newRandomUint64 } from "./bigint";
import { newRandomAddress } from "./address";
import { newRandomChainAssets } from "./assets";
import { EthereumSignature } from "#erdstall/crypto/ethereum";

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
	proofConstructor: (rng: PRNG, size: number) => ChainProofChunk,
	assetSize: number,
	size: number,
): BalanceProofs {
	throw new Error("not implemented");
	//	const bps = new BalanceProofs();
	//	for (let i = 0; i < size; i++) {
	//		bps.map.set(
	//			newRandomAddress(rng).toString(),
	//			proofConstructor(rng, assetSize),
	//		);
	//	}
	//	return bps;
}

export function newRandomBalanceProof(
	rng: PRNG,
	size: number,
): ChainProofChunk {
	return new ChainProofChunk(
		newRandomChainAssets(rng, size),
		new EthereumSignature(
			newRandomUint8Array(rng, 32),
			newRandomAddress(rng),
		),
	);
}

export function newRandomExitProof(rng: PRNG, size: number): ChainProofChunk {
	throw new Error("not implemented");
	// const bp = newRandomBalanceProof(rng, size);
	// bp.balance.exit = true;
	// return bp;
}
