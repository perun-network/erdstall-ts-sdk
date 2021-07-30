// SPDX-License-Identifier: Apache-2.0

import PRNG, { NewRandomUint8Array } from "./random";
import { entropyToMnemonic } from "@ethersproject/hdnode";
import { Wallet } from "@ethersproject/wallet";

export function newRandomWallet(rng: PRNG) {
	const entropy = NewRandomUint8Array(rng, 32);
	const mnemonic = entropyToMnemonic(entropy);
	return Wallet.fromMnemonic(mnemonic);
}
