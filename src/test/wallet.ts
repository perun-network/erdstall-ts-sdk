// SPDX-License-Identifier: Apache-2.0

import PRNG, { newRandomUint8Array } from "./random";
import { Mnemonic, Wallet, BaseWallet } from "ethers";

export function newRandomWallet(rng: PRNG): BaseWallet {
	const entropy = newRandomUint8Array(rng, 32);
	const mnemonic = Mnemonic.fromEntropy(entropy);
	return Wallet.fromPhrase(mnemonic.phrase);
}
