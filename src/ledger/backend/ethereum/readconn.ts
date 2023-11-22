// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallEventHandler } from "#erdstall";
import { Address } from "#erdstall/crypto";
import { LedgerEvent } from "#erdstall/ledger";
import { NFTMetadata } from "#erdstall/ledger/backend";
import { Erdstall } from "./contracts/contracts/Erdstall";
import { IERC721Metadata__factory } from "./contracts";
import { ethCallbackShim, Listener } from "./ethwrapper";
import { LedgerReader } from "#erdstall/ledger/backend";
import { EthereumTokenProvider } from "./tokencache";
import axios from "axios";

export const ErrUnsupportedLedgerEvent = new Error(
	"unsupported ledger event encountered",
);
export const ErrErdstallContractNotConnected = new Error(
	"erdstall contract not connected",
);

export class LedgerReadConn implements LedgerReader<"ethereum"> {
	readonly contract: Erdstall;
	private eventCache: Map<
		ErdstallEventHandler<LedgerEvent, "ethereum">,
		Listener
	>;
	private metadataCache: Map<string, NFTMetadata>;
	readonly tokenCache: EthereumTokenProvider;

	constructor(contract: Erdstall, tokenCache: EthereumTokenProvider) {
		this.contract = contract;
		this.eventCache = new Map();
		this.metadataCache = new Map();
		this.tokenCache = tokenCache;
	}

	on<T extends LedgerEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		const wcb = ethCallbackShim(this.contract, ev, cb);
		this.eventCache.set(cb, wcb);
		this.contract.on(ev, wcb);
	}

	once<T extends LedgerEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		this.contract.once(
			ev,
			ethCallbackShim(this.contract, ev, cb),
		);
	}

	off<T extends LedgerEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		if (!this.eventCache.has(cb)) {
			return;
		}
		const wcb = this.eventCache.get(cb)!;
		this.contract.off(ev, wcb);
		this.eventCache.delete(cb);
	}

	removeAllListeners() {
		this.eventCache.clear();
		this.contract.removeAllListeners();
	}

	erdstall(): { chain: "ethereum"; address: Address<"ethereum"> }[] {
		throw new Error("not implemented");
		//		return Address.fromString(this.contract.address);
	}

	async getNftMetadata(
		_backend: "ethereum",
		token: Address<"ethereum">,
		id: bigint,
		useCache?: boolean,
	): Promise<NFTMetadata> {
		const tokenKey = token.key;
		if (
			(useCache == undefined || useCache) &&
			this.metadataCache.has(tokenKey)
		) {
			return this.metadataCache.get(tokenKey)!;
		}

		// TODO: Create IMetadata contract interface for which bindings can be
		// generated, so we have a single interface over which we can query
		// metadata for different contract implementations in the future.
		const metadataContract = IERC721Metadata__factory.connect(
			tokenKey,
			this.contract.provider,
		);
		const tokenURI = await metadataContract.tokenURI(id);
		const res = await axios
			.get<NFTMetadata>(tokenURI)
			.then((res) => res.data);
		this.metadataCache.set(tokenKey, res);
		return res;
	}
}
