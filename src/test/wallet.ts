// SPDX-License-Identifier: Apache-2.0

import PRNG, { newRandomUint8Array } from "./random";
import { utils, Wallet } from "ethers";

export function newRandomWallet(rng: PRNG): Wallet {
	const entropy = newRandomUint8Array(rng, 32);
	const mnemonic = utils.entropyToMnemonic(entropy);
	return Wallet.fromMnemonic(mnemonic);
}
