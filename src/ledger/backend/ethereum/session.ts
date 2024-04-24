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
import { Chain } from "#erdstall/ledger";
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

	async deposit(
		assets: ChainAssets,
	): Promise<TransactionGenerator<"ethereum">> {
		return this.erdstallConn.deposit(assets);
	}

	async withdraw(
		epoch: bigint,
		exitProof: ChainProofChunk[],
	): Promise<TransactionGenerator<"ethereum">> {
		return this.erdstallConn.withdraw(epoch, exitProof);
	}
}

export function defaultEthereumSessionInitializer(
	config: ClientConfig,
	signer: Signer,
): EthereumSession {
	const ethCfg = config.chains.find(c => c.id == Chain.EthereumMainnet)
		?? config.chains.find(c => c.type === "ethereum");

	const erdstall = Erdstall__factory.connect(
		(ethCfg! as ChainConfig<"ethereum">).data.contract.toString(),
		signer,
	);
	const ledgerWriter = new LedgerWriteConn(
		erdstall,
		ethCfg!.id,
		new EthereumTokenProvider(ethCfg!.id));

	return new EthereumSession(signer, ledgerWriter);
}

export function mkDefaultEthereumSessionConstructor(signer: Signer): {
	backend: "ethereum";
	provider: ethers.Provider | Signer;
	signer: Signer;
	initializer: (config: ClientConfig, signer: Signer) => EthereumSession;
} {
	return {
		backend: "ethereum",
		signer: signer,
		provider: signer,
		initializer: defaultEthereumSessionInitializer,
	};
}
