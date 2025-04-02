// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EthereumAddress } from "#erdstall/crypto/ethereum";
import {
	TypedJSON,
	jsonObject,
	jsonMember
} from "#erdstall/export/typedjson"

@jsonObject
export class EthereumChainConfig {
	@jsonMember(() => EthereumAddress) contract: EthereumAddress;
	@jsonMember(String) networkID?: string;
	@jsonMember(String) nodeRPC?: string;
	@jsonMember(Number) powDepth: number;

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

		// NOTE HACK: remove once we fixed the operator.
		if(!this.nodeRPC && !this.networkID)
			this.networkID = "sepolia";
	}

	clone(): EthereumChainConfig {
		return new EthereumChainConfig({
			contract: this.contract.clone() as EthereumAddress,
			networkID: this.networkID,
			nodeRPC: this.nodeRPC,
			powDepth: this.powDepth
		});
	}

	type(): string { return "ethereum"; }

	toJSON(): any {
		return {
			contract: this.contract.toJSON(),
			networkID: this.networkID,
			nodeRPC: this.nodeRPC,
			powDepth: this.powDepth
		};
	}

	static fromJSON(json: any): EthereumChainConfig{
		return new EthereumChainConfig({
			contract: EthereumAddress.fromJSON(json.contract),
			networkID: json.networkID,
			nodeRPC: json.nodeRPC,
			powDepth: json.powDepth
		});
	}
}
