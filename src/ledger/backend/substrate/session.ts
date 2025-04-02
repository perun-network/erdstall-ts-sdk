// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ChainProofChunk, ClientConfig, ChainConfig } from "#erdstall/api/responses";
import { ChainSession } from "#erdstall/session";
import { LedgerEventEmitters } from "#erdstall/event";
import { ChainAssets, Amount, Tokens } from "#erdstall/ledger/assets";
import { Chain, getChainName } from "#erdstall/ledger";
import { SubstrateSigner } from "#erdstall/crypto/substrate";
import { SubstrateClient } from "./client";
import { SubstrateChainConfig } from "./chainconfig";

import {
	UnsignedTx,
	UnsignedTxBatch,
	SignedTx,
	SignedTxBatch,
	TxReceipt,
	TxReceiptBatch
} from "#erdstall/ledger/backend";
import {
	SubstrateTxSigner,
	UnsignedSubstrateTransaction,
	SubstrateTxSender,
	SignedSubstrateTransaction
} from "./txs";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { API } from "./txs";

export class SubstrateSession extends ChainSession {
	#signer: SubstrateSigner;
	#api: Promise<API>;
	#chain: Chain;
	#events: LedgerEventEmitters;

	#txsender: Promise<SubstrateTxSender>;
	#txsigner: Promise<SubstrateTxSigner>;

	constructor(
		signer: SubstrateSigner,
		chain: Chain,
		wsProvider: URL,
		events: LedgerEventEmitters
	) {
		super();
		this.#chain = chain;
		this.#signer = signer;
		this.#events = events;
		const api = ApiPromise.create({
			provider: new WsProvider(wsProvider.toString())
		});
		this.#api = api.then(api => new API(chain, (api.tx as any).wildcard));
		this.#txsigner = (async() => {
			return new SubstrateTxSigner(chain, await api, signer);
		})();
		// TODO: ???
		this.#txsender = Promise.resolve(new SubstrateTxSender(chain));
	}

	static fromConfig(
		config: ChainConfig,
		signer: SubstrateSigner,
		events: LedgerEventEmitters): SubstrateSession
	{
		if(!(config.data instanceof SubstrateChainConfig))
			throw new Error(`Config must be substrate config, is ${config.data.type()}`);

		return new SubstrateSession(
			signer,
			config.id,
			new URL(config.data.blockStreamLAddr),
			events);
	}

	static bigintABI(v: bigint): Uint8Array {
		let ret = new Uint8Array(32);

		for(let i = 0n; i < 32n; i++) {
			ret[Number(i)] = Number((v >> (8n*i)) & 0xffn);
		}
		return ret;
	}

	override async signTx(tx: UnsignedTx): Promise<SignedTx>
	{
		if(!(tx instanceof UnsignedSubstrateTransaction))
			throw new Error("Invalid transaction type, expected substrate transaction");
		return await (await this.#txsigner).signing_session(async(session: any) => {
			return await tx.sign(await this.#txsigner, session);
		});
	}

	override async signTxBatch(txs: UnsignedTxBatch): Promise<SignedTxBatch>
	{
		/*if(!(txs instanceof UnsignedSubstrateTransaction))
			throw new Error("Invalid transaction type, expected ethereum transaction");*/
		return await (await this.#txsigner).signing_session(async(session: any) => {
			return await txs.sign(await this.#txsigner, session);
		});
	}

	/* NOTE IMPROVE: we can do TX batching like this, but for now it's needlessly complicating our efforts:
		while(txs.length)
		{
			const batch = api.tx.utility.batch(txs.slice(0, batchSize));
			ret.push(batch);
			txs = txs.slice(batchSize);
		}
	*/

	async deposit(
		assets: ChainAssets,
	): Promise<UnsignedTxBatch> {
		let ordered = assets.ordered();
		let api = await this.#api;
		
		let txs: UnsignedTx[] = [];
		for(const [asset, amount] of ordered)
			txs.push(...api.deposit(asset, amount));

		return new UnsignedTxBatch(txs);
	}
	async withdraw(
		epoch: bigint,
		exitProof: ChainProofChunk[],
	): Promise<UnsignedTxBatch> {
		let api = await this.#api;
		const txs: any[] = [];
		for (let i = 0; i <  exitProof.length; i++) {
			txs.push(...api.withdraw({
				proofs: exitProof,
				chunk: i,
				user: this.#signer.address(),
				exit: true,
				epoch: epoch
			}));
		}

		return new UnsignedTxBatch(txs);
	}

	override async sendTx(tx: SignedTx): Promise<TxReceipt>
	{
		if(!(tx instanceof SignedSubstrateTransaction))
			throw new Error("Invalid transaction type, expected substrate transaction");
		console.log(`SubstrateSession.sendTx() on ${getChainName(this.#chain)}`);
		return await tx.send(await this.#txsender);
	}

	override async sendTxBatch(txs: SignedTxBatch): Promise<TxReceiptBatch>
	{
		return await txs.send(await this.#txsigner, await this.#txsender);
	}

	/*private async *issueTXs(
		txs: [StageName<"substrate">, any][]
	): AsyncGenerator<[
		StageName<"substrate">,
		StageTransaction<"substrate">
	], void, void> {
		const api = await(this.#api);
		for(let i = 0; i < txs.length; ++i)
		{
			const [name, batch] = txs[i];
			const status = new Promise<void>((accept, reject) => {
				batch.signAndSend(this.signer.keyPair, {nonce: 0}, ({status, events}: {
					status: any,
					events: any
				}) => {
					if(status.isInBlock || status.isFinalized) {
						for(const { event: {
							data: [error, info]
						}} of events.filter(({event}:{
							event: any
						}) => api.events.system.ExtrinsicFailed.is(event)))
						{
							if(error.isModule) {
								const decoded = api.registry.findMetaError(
									error.asModule);
								reject(new Error(
									`${decoded.section}:${decoded.method}: ${
										decoded.docs.join(" ")
									}`));
								return;
							}
						}
					}

					if(status.isFinalized) {
						// NOTE IMPROVE: transaction hash or something.
						accept();
					}
				});	
			});

			yield [name, status];
			if(i == txs.length-1){
				return;
			} else {
				await status;
			}
		}
		throw new Error("no transactions to be sent!");
	}*/
}