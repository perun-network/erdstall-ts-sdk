// SPDX-License-Identifier: Apache-2.0
"use strict";

// It might happen that we add support for chains that require different
// schemes. It might also happen that we add support for chains that support the
// same scheme used by another chain.
//
// E.g.: Adding the chain BOGUS might be compatible with the schemes used by
// ethereum. In that case we would have BalanceProofs for BOGUS which contains
// signatures and addresses tagged as `ethereum`.

type _supportedCryptos = {
	// Crypt used for ethereum: ECDSA.
	ethereum: [];
	// Crypto used for substrate: SR25519.
	substrate: [];

	test: [];
};

// The crypto supported and used in Erdstall.
export type Crypto = keyof _supportedCryptos;
