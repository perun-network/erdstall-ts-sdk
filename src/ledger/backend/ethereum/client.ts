// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallBackendClient, ErdstallEventHandler } from "#erdstall";
import { LedgerEvent } from "#erdstall/ledger";
import { Address } from "#erdstall/crypto";
import { ethers, Signer } from "ethers";
import { LocalAsset } from "#erdstall/ledger/assets";
import {
	Erdstall__factory,
	LedgerReadConn,
} from "#erdstall/ledger/backend/ethereum";
import { ChainConfig, ClientConfig } from "#erdstall/api/responses";
import { EthereumTokenProvider } from "./tokencache";

export class EthereumClient implements ErdstallBackendClient<"ethereum"> {
	protected provider: ethers.providers.Provider | Signer;
	protected erdstallConn: LedgerReadConn;

	constructor(
		provider: ethers.providers.Provider | Signer,
		erdstallConn: LedgerReadConn,
	) {
		this.provider = provider;
		this.erdstallConn = erdstallConn;
	}

	erdstall() {
		return this.erdstallConn.erdstall();
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
	// NOTE CLEANUP: Temporary hack.
	const erdstallAddr = (config.chains[0] as ChainConfig<"ethereum">).data.contract;
	const erdstall = Erdstall__factory.connect(erdstallAddr.toString(), provider);
	const ledgerReader = new LedgerReadConn(erdstall, new EthereumTokenProvider());

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
