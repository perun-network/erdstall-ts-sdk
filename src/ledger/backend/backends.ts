// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ContractPromise } from "@polkadot/api-contract";
import { Erdstall as ErdstallEthereum } from "./ethereum/contracts";

// The list of all supported backends. It defines the type of contract
// connector used to access the Erdstall contract on each chain.
type _supportedBackendConnectors = {
	ethereum: ErdstallEthereum;
	substrate: ContractPromise;

	// If also supports Kusama, call it Substrate. @JW
};

export type Backend = keyof _supportedBackendConnectors;

// The identifier of all supported backends.
export type BackendIDs = {
	[B in Backend]: B;
};

export type ErdstallConnector<B extends Backend> =
	_supportedBackendConnectors[B];

export type RequestedBackends<Bs extends Backend[]> = Bs[number];
