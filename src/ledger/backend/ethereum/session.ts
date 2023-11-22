// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";

import {
	ChainConfig,
	ChainProofChunk,
	ClientConfig,
} from "#erdstall/api/responses";
import { Address } from "#erdstall/crypto";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { ChainAssets } from "#erdstall/ledger/assets";
import {
	Erdstall__factory,
	EthereumClient,
	LedgerWriteConn,
	EthereumTokenProvider,
} from "#erdstall/ledger/backend/ethereum";
import { ErdstallBackendSession } from "#erdstall";
import { TransactionGenerator } from "#erdstall/utils";
import { Backend } from "#erdstall/ledger/backend/backends";

export const ErrUnitialisedClient = new Error("client unitialised");

export class EthereumSession
	extends EthereumClient
	implements ErdstallBackendSession<"ethereum">
{
	private readonly signer: Signer;
	protected erdstallConn: LedgerWriteConn;

	constructor(signer: Signer, erdstallConn: LedgerWriteConn) {
		super(signer, erdstallConn);
		this.signer = signer;
		this.erdstallConn = erdstallConn;
	}

	async deposit<B extends "ethereum">(
		backend: B,
		assets: ChainAssets,
	): Promise<TransactionGenerator<B>> {
		return this.erdstallConn.deposit(backend, assets);
	}

	async withdraw<B extends "ethereum">(
		backend: B,
		epoch: bigint,
		exitProof: ChainProofChunk[],
	): Promise<TransactionGenerator<B>> {
		return this.erdstallConn.withdraw(backend, epoch, exitProof);
	}
}

export function defaultEthereumSessionInitializer(
	config: ClientConfig,
	signer: Signer,
): EthereumSession {
	const erdstall = Erdstall__factory.connect(
		(config.chains[0] as ChainConfig<"ethereum">).data.contract.toString(),
		signer,
	);
	const ledgerWriter = new LedgerWriteConn(
		erdstall,
		1, // CHAIN_ETH
		new EthereumTokenProvider());

	return new EthereumSession(signer, ledgerWriter);
}

export function mkDefaultEthereumSessionConstructor(signer: Signer): {
	backend: "ethereum";
	provider: ethers.providers.Provider | Signer;
	signer: Signer;
	initializer: (config: ClientConfig, signer: Signer) => EthereumSession;
} {
	return {
		backend: "ethereum",
		signer: signer,
		// TODO: Single source of truth for the session constructor.
		provider: signer,
		initializer: defaultEthereumSessionInitializer,
	};
}
