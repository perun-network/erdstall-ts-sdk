// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EthereumAddress } from "#erdstall/crypto/ethereum";

export class EthereumChainConfig {
	contract: EthereumAddress;
	networkID?: string;
	nodeRPC?: string;
	powDepth: number;

	constructor(arg: {
		contract: EthereumAddress,
		networkID?: string,
		nodeRPC?: string,
		powDepth: number
	}) {
		this.contract = arg.contract;
		this.networkID = arg.networkID;
		this.nodeRPC = arg.nodeRPC;
		this.powDepth = arg.powDepth;
	}

	clone(): EthereumChainConfig {
		return new EthereumChainConfig({
			contract: this.contract.clone() as EthereumAddress,
			networkID: this.networkID,
			nodeRPC: this.nodeRPC,
			powDepth: this.powDepth
		});
	}
}
