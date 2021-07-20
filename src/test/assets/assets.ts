// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "#erdstall/test/random";
import { Asset, Assets } from "#erdstall/ledger/assets";
import { NewRandomTokens } from "#erdstall/test/assets/tokens";
import { NewRandomAmount } from "#erdstall/test/assets/amount";
import { NewRandomAddress } from "#erdstall/test/address";

// NewRandomAssets creates an Assets type. The size is limited by `size` and
// all included `Tokens`, if any, have a maximum size of `size`.
export function NewRandomAssets(rng: PRNG, size: number): Assets {
	const assets = new Assets();
	for (let i = 0; i < size; i++) {
		const asset: Asset =
			rng.uFloat32() < 0.5
				? NewRandomAmount(rng)
				: NewRandomTokens(rng, size);
		assets.addAsset(NewRandomAddress(rng).toString(), asset);
	}
	return assets;
}
