// SPDX-License-Identifier: Apache-2.0
"use strict";

export enum Chain {
	Erdstall = 0,

	// Production chains.
	EthereumMainnet = 1,
	Ajuna = 1328,
	Bajun = 1337,

	// Generic testnet chains start at half of the uint16 range.
	TestChain0 = 0x8000,
	TestChain1,
	TestChain2,
	TestChain3,
	TestChain4,
	TestChain5,
	TestChain6,
	TestChain7,
	TestChain8,
	TestChain9,

	// Special testnet chains.
	Goerli = 0xffff - 5,
	Ropsten = 0xffff - 1,
	Rinkeby = 0xffff - 0,
}
