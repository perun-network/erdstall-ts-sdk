// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallWatcher, Contracter } from "#erdstall";
import { Address, LedgerEvent } from "#erdstall/ledger";
import { TokenProvider } from "./tokencache";
import { Erdstall } from "./contracts/Erdstall";
import { NFTMetadata, NFTMetadataProvider } from "./metadata";
import { IERC721Metadata__factory } from "./contracts";
import axios from "axios";

export const ErrUnsupportedLedgerEvent = new Error(
	"unsupported ledger event encountered",
);
export const ErrErdstallContractNotConnected = new Error(
	"erdstall contract not connected",
);

export interface LedgerReader
	extends NFTMetadataProvider,
		ErdstallWatcher,
		Contracter {}

export class LedgerReadConn implements LedgerReader {
	readonly contract: Erdstall;
	private eventCache: Map<Function, (args: Array<any>) => void>;
	private metadataCache: Map<string, NFTMetadata>;
	readonly tokenCache: TokenProvider;

	constructor(contract: Erdstall, tokenCache: TokenProvider) {
		this.contract = contract;
		this.eventCache = new Map();
		this.metadataCache = new Map();
		this.tokenCache = tokenCache;
	}

	on(ev: LedgerEvent, cb: Function): void {
		const wrappedCB = (args: Array<any>) => {
			cb(args);
		};
		this.eventCache.set(cb, wrappedCB);
		this.contract.on(ev, wrappedCB);
	}

	once(ev: LedgerEvent, cb: Function): void {
		this.contract.once(ev, (args: Array<any>) => {
			cb(args);
		});
	}

	off(ev: LedgerEvent, cb: Function): void {
		if (!this.eventCache.has(cb)) {
			return;
		}
		this.contract.off(ev, this.eventCache.get(cb)!);
		this.eventCache.delete(cb);
	}

	erdstall(): Address {
		return Address.fromString(this.contract.address);
	}

	async getNftMetadata(
		token: Address,
		id: bigint,
		useCache?: boolean,
	): Promise<NFTMetadata> {
		const tokenS = token.toString();
		if (
			(useCache == undefined || useCache) &&
			this.metadataCache.has(tokenS)
		) {
			return this.metadataCache.get(tokenS)!;
		}

		// TODO: Create IMetadata contract interface for which bindings can be
		// generated, so we have a single interface over which we can query
		// metadata for different contract implementations in the future.
		const metadataContract = IERC721Metadata__factory.connect(
			tokenS,
			this.contract.provider,
		);
		const tokenURI = await metadataContract.tokenURI(id);
		const res = await axios
			.get<NFTMetadata>(tokenURI)
			.then((res) => res.data);
		this.metadataCache.set(tokenS, res);
		return res;
	}
}
