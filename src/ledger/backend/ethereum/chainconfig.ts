// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EthereumAddress } from "#erdstall/crypto/ethereum";

export interface EthereumChainConfig {
	contract: EthereumAddress;
	networkID: string;
	powDepth: number;
}
