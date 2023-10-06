// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallBackendClient, ErdstallEventHandler } from "#erdstall";
import { LedgerEvent } from "#erdstall/ledger";
import { Address } from "#erdstall/crypto";
import { ethers, Signer } from "ethers";
import { NFTMetadata } from "#erdstall/ledger/backend";
import { OnChainQuerier } from "#erdstall/ledger/onChainQuerier";
import {
	Erdstall__factory,
	EthereumOnChainQuerier,
	LedgerReadConn,
	TokenFetcher,
} from "#erdstall/ledger/backend/ethereum";
import { ChainConfig, ClientConfig } from "#erdstall/api/responses";

export class EthereumClient implements ErdstallBackendClient<"ethereum"> {
	readonly onChainQuerier: OnChainQuerier<"ethereum">;
	protected provider: ethers.providers.Provider | Signer;
	protected erdstallConn: LedgerReadConn;

	constructor(
		provider: ethers.providers.Provider | Signer,
		erdstallConn: LedgerReadConn,
	) {
		this.provider = provider;
		this.erdstallConn = erdstallConn;
		this.onChainQuerier = new EthereumOnChainQuerier(this.provider);
	}

	erdstall() {
		return this.erdstallConn.erdstall();
	}

	getNftMetadata(
		backend: "ethereum",
		token: Address<"ethereum">,
		id: bigint,
		useCache?: boolean,
	): Promise<NFTMetadata> {
		return this.erdstallConn.getNftMetadata(backend, token, id, useCache);
	}

	on<T extends LedgerEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		this.erdstallConn.on(ev, cb);
	}

	once<T extends LedgerEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		this.erdstallConn.once(ev, cb);
	}

	off<T extends LedgerEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		this.erdstallConn.off(ev, cb);
	}

	removeAllListeners(): void {
		this.erdstallConn.removeAllListeners();
	}
}

export function defaultEthereumClientInitializer(
	config: ClientConfig,
	provider: ethers.providers.Provider | Signer,
): EthereumClient {
	// TODO: Temporary hack.
	const erdstall = Erdstall__factory.connect(
		(config.chains[0] as ChainConfig<"ethereum">).data.contract.toString(),
		provider,
	);
	const ledgerReader = new LedgerReadConn(erdstall, new TokenFetcher());

	return new EthereumClient(provider, ledgerReader);
}

export function mkDefaultEthereumClientConstructor(
	provider: ethers.providers.Provider | Signer,
): {
	backend: "ethereum";
	provider: ethers.providers.Provider | Signer;
	initializer: (
		config: ClientConfig,
		provider: ethers.providers.Provider | Signer,
	) => EthereumClient;
} {
	return {
		backend: "ethereum",
		provider: provider,
		initializer: defaultEthereumClientInitializer,
	};
}
