// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer as EthersSigner } from "ethers";

import {
	ChainConfig,
	ChainProofChunk,
	ClientConfig,
} from "#erdstall/api/responses";
import { Address } from "#erdstall/crypto";
import { EthereumAddress, EthereumSigner } from "#erdstall/crypto/ethereum";
import { ChainAssets } from "#erdstall/ledger/assets";
import { Chain, getChainName } from "#erdstall/ledger";
import {
	Erdstall__factory,
	Erdstall,
	EthereumClient,
	LedgerConn,
	EthereumTokenProvider,
} from "#erdstall/ledger/backend/ethereum";
import { LedgerEventEmitters } from "#erdstall/event";
import {
	UnsignedTx,
	UnsignedTxBatch,
	SignedTx,
	SignedTxBatch,
	TxReceipt,
	TxReceiptBatch
} from "#erdstall/ledger/backend";
import { ChainSession } from "#erdstall/session";

import {
	EthTxSigner,
	EthTxSender,
	UnsignedEthTransaction,
	SignedEthTransaction
} from "./transaction";

import { EthereumChainConfig } from "./chainconfig";

export const ErrUnitialisedClient = new Error("client unitialised");

export class EthereumSession extends ChainSession
{
	#events: LedgerEventEmitters;
	#conn: LedgerConn;
	#signer: EthereumSigner;
	#txsender: EthTxSender;
	#txsigner: EthTxSigner;

	get chain(): Chain { return this.#conn.chain; }

	static fromConfig(
		config: ChainConfig,
		signer: EthereumSigner,
		events: LedgerEventEmitters): EthereumSession
	{
		if(!(config.data instanceof EthereumChainConfig))
			throw new Error("Expected an ethereum chain config");

		let network: string;
		if(config.data.nodeRPC)
		{
			network = config.data.nodeRPC;
			if(!network.includes("://"))
			{
				// if nothing is specified, we guess the protocol.
				network = "ws://" + network;
				console.info(`EthereumSession.fromConfig: Network '${network}' has no protocol. falling back to ws://`)
			}
		} else if(config.data.networkID) network = config.data.networkID;
		else throw new Error("config does not specify a connectable node");

		console.info(`Connecting to ${getChainName(config.id)} at "${network}"`);

		const provider = ethers.getDefaultProvider(network);

		return new EthereumSession(
			config.data.contract,
			provider,
			signer,
			config.id,
			events);
	}

	constructor(
		contract: EthereumAddress,
		provider: ethers.Provider,
		signer: EthereumSigner,
		chain: Chain,
		events: LedgerEventEmitters
	) {
		super();
		this.#events = events;
		this.#signer = signer;
		this.#txsender = new EthTxSender(chain, provider);
		this.#txsigner = this.#signer.toTxSigner(chain, provider);
		this.#conn = LedgerConn.writing(contract, signer, provider, chain, events);
	}

	async deposit(
		assets: ChainAssets,
	): Promise<UnsignedTxBatch> {
		return this.#conn.deposit(assets);
	}

	async withdraw(
		epoch: bigint,
		exitProof: ChainProofChunk[],
	): Promise<UnsignedTxBatch> {
		return this.#conn.withdraw(epoch, exitProof);
	}

	override async signTx(tx: UnsignedTx): Promise<SignedTx>
	{
		if(!(tx instanceof UnsignedEthTransaction))
			throw new Error("Invalid transaction type, expected ethereum transaction");
		return await this.#txsigner.signing_session(async(session: any) => {
			return await tx.sign(this.#txsigner, session);
		});
	}

	override async signTxBatch(txs: UnsignedTxBatch): Promise<SignedTxBatch>
	{
		/*if(!(txs instanceof UnsignedEthTransaction))
			throw new Error("Invalid transaction type, expected ethereum transaction");*/
		return await this.#txsigner.signing_session(async(session: any) => {
			return await txs.sign(this.#txsigner, session);
		});
	}

	override async sendTx(tx: SignedTx): Promise<TxReceipt>
	{
		if(!(tx instanceof SignedEthTransaction))
			throw new Error("Invalid transaction type, expected ethereum transaction");

		console.log(`EthereumSession.sendTx() on ${getChainName(this.chain)}`);
		return await tx.send(this.#txsender);
	}

	override async sendTxBatch(txs: SignedTxBatch): Promise<TxReceiptBatch>
	{
		return await txs.send(this.#txsigner, this.#txsender);
	}
}
