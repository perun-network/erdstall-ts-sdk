// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Provider } from "ethers";
import { ChainClient } from "#erdstall/client";
import { LedgerEventEmitters, LedgerEventMask } from "#erdstall/event";
import { Chain, getChainName } from "#erdstall/ledger";
import { Address } from "#erdstall/crypto";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { ethers } from "ethers";
import {
	Erdstall__factory,
	Erdstall,
	EthereumChainConfig
} from "#erdstall/ledger/backend/ethereum";
import { LedgerConn } from "./writeconn";
import { ChainConfig } from "#erdstall/api/responses";

export class EthereumClient extends ChainClient
{
	#events: LedgerEventEmitters;
	#conn: LedgerConn;

	get chain(): Chain { return this.#conn.chain; }

	static fromConfig(config: ChainConfig, events: LedgerEventEmitters)
	{
		if(!(config.data instanceof EthereumChainConfig))
			throw new Error("Expected an ethereum chain config");

		let network: string;
		if(config.data.nodeRPC) network = config.data.nodeRPC;
		else if(config.data.networkID) network = config.data.networkID;
		else throw new Error("config does not specify a connectable node");

		console.info(`Connecting to ${getChainName(config.id)} at "${network}"`);

		const provider = ethers.getDefaultProvider(network);

		return new EthereumClient(
			config.data.contract,
			provider,
			config.id,
			events);
	}

	constructor(
		contract: EthereumAddress,
		provider: Provider,
		chain: Chain,
		events: LedgerEventEmitters
	) {
		super();
		this.#events = events;
		this.#conn = LedgerConn.readonly(contract, provider, chain, events);
	}

	override update_event_tracking(mask: LedgerEventMask)
		{ this.#conn.update_event_tracking(mask); }
}