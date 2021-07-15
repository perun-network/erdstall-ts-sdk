// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG from "../random";
import { Asset } from "../../src/ledger/assets/asset";
import { Assets } from "../../src/ledger/assets/assets";
import { NewRandomTokens } from "./tokens";
import { NewRandomAmount } from "./amount";
import { NewRandomAddress } from "../address";

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
