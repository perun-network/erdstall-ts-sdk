// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "#erdstall/test/random";
import { newRandomAddress } from "#erdstall/test";
import { Asset, Assets } from "#erdstall/ledger/assets";
import { newRandomTokens } from "./tokens";
import { newRandomAmount } from "./amount";

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
