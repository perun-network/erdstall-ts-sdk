// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ContractPromise } from "@polkadot/api-contract";
import { Erdstall as ErdstallEthereum } from "./ethereum/contracts";
import { EthereumChainConfig } from "./ethereum/chainconfig";
import { SubstrateChainConfig } from "./substrate/chainconfig";

// The list of all supported backends. It defines the type of contract
// connector used to access the Erdstall contract on each chain.
type _supportedBackendConnectors = {
	ethereum: [ErdstallEthereum, EthereumChainConfig];

	// If also supports Kusama, call it Substrate. @JW
	substrate: [ContractPromise, SubstrateChainConfig];

	// TODO: Might be removable.
	test: [null, null];
};

export type Backend = keyof _supportedBackendConnectors;

// The identifier of all supported backends.
export type BackendIDs = {
	[B in Backend]: B;
};

export type ErdstallConnector<B extends Backend> =
	_supportedBackendConnectors[B][0];

export type BackendChainConfig<B extends Backend> =
	_supportedBackendConnectors[B][1];

export type RequestedBackends<Bs extends Backend[]> = Bs[number];
