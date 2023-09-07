// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "#erdstall/test/random";
import { newRandomAddress } from "#erdstall/test";
import {
	Amount,
	Asset,
	Assets,
	ChainAssets,
	LocalAssets,
	LocalFungibles,
	LocalNonFungibles,
	Tokens,
} from "#erdstall/ledger/assets";
import { newRandomTokens } from "./tokens";
import { newRandomAmount } from "./amount";
import { Chain } from "#erdstall/ledger/chain";

// newRandomAssets creates an Assets type. The size is limited by `size` and
// all included `Tokens`, if any, have a maximum size of `size`.
export function newRandomAssets(rng: PRNG, size: number): Assets {
	const assets = new Assets();
	for (let i = 0; i < size; i++) {
		const asset: Asset =
			rng.uFloat32() < 0.5
				? newRandomAmount(rng)
				: newRandomTokens(rng, size);
		assets.addAsset(newRandomAddress(rng).toString(), asset);
	}
	return assets;
}

// newRandomChainAssets creates an Assets type. The size is limited by `size` and
// all included `Tokens`, if any, have a maximum size of `size`.
export function newRandomChainAssets(rng: PRNG, size: number): ChainAssets {
	const chainAssets = new Map<Chain, LocalAssets>();
	for (const chain in Chain) {
		for (let i = 0; i < size; i++) {
			if (typeof Chain[chain] === "number") {
				chainAssets.set(
					Chain[chain] as unknown as Chain,
					newRandomLocalAssets(rng, size),
				);
			}
		}
	}
	return new ChainAssets(chainAssets);
}

// newRandomLocalAssets creates an Assets type. The size is limited by `size` and
// all included `Tokens`, if any, have a maximum size of `size`.
export function newRandomLocalAssets(rng: PRNG, size: number): LocalAssets {
	return new LocalAssets(
		newRandomLocalFungibles(rng, rng.uInt32() % size),
		newRandomLocalNonFungibles(rng, rng.uInt32() % size),
	);
}

export function newRandomLocalFungibles(
	rng: PRNG,
	size: number,
): LocalFungibles {
	const assets = new Map<string, Amount>();
	for (let i = 0; i < size; i++) {
		assets.set(newRandomAddress(rng).toString(), newRandomAmount(rng));
	}
	return new LocalFungibles(assets);
}

export function newRandomLocalNonFungibles(
	rng: PRNG,
	size: number,
): LocalNonFungibles {
	const assets = new Map<string, Tokens>();
	for (let i = 0; i < size; i++) {
		assets.set(
			newRandomAddress(rng).toString(),
			newRandomTokens(rng, size),
		);
	}
	return new LocalNonFungibles(assets);
}
