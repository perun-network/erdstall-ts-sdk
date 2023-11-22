// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ChainProofChunk, ClientConfig } from "#erdstall/api/responses";
import { ErdstallBackendSession } from "#erdstall/erdstall";
import { Assets, ChainAssets, Amount, Tokens } from "#erdstall/ledger/assets";
import { StageName, StageTransaction, TransactionGenerator } from "#erdstall/utils";
import { SubstrateSigner } from "#erdstall/crypto/substrate";
import { SubstrateClient } from "./client";

import { ApiPromise } from "@polkadot/api";

export class SubstrateSession
	extends SubstrateClient
	implements ErdstallBackendSession<"substrate">
{
	private signer: SubstrateSigner;
	private api: Promise<ApiPromise>;
	private chain: number;

	constructor(
		signer: SubstrateSigner,
		chain: number,
		wsProvider: URL,
	) {
		super(wsProvider);
		this.signer = signer;
		this.api = ApiPromise.create({ provider: this.provider });
		this.chain = chain;
	}

	static bigintABI(v: bigint): Uint8Array {
		let ret = new Uint8Array(32);

		for(let i = 0n; i < 32n; i++) {
			ret[Number(i)] = Number((v >> (8n*i)) & 0xffn);
		}
		return ret;
	}

	private async chunk_txs(txs: any[]): Promise<any[]> {
		let api = await this.api;
		const ret = [];

		const batchSize = 16;

		while(txs.length)
		{
			const batch = api.tx.utility.batch(txs.slice(0, batchSize));
			ret.push(batch);
			txs = txs.slice(batchSize);
		}

		return ret;
	}

	async deposit(
		assets: ChainAssets,
	): Promise<TransactionGenerator<"substrate">> {
		let api = await this.api;
		const txs: any[] = [];
		for(let [assetID, asset] of assets.ordered())
		{
			let calls: Object[];
			if(asset instanceof Amount) {
				calls = [{
					origin: assetID.origin(),
					asset_type: assetID.type(),
					primary_id: assetID.localID(),
					secondary_id: (asset as Amount).toJSON(),
				}];
			} else {
				calls = (asset as Tokens).value.map(id => ({
					origin: assetID.origin(),
					asset_type: assetID.type(),
					primary_id: assetID.localID(),
					secondary_id: id,
				}));
			}

			for(let call of calls)
				txs.push(api.tx.erdstall.deposit(call));
		}
		let chunks = await this.chunk_txs(txs);
		return { stages: this.issueTXs(chunks), numStages: chunks.length };
	}
	async withdraw(
		epoch: bigint,
		exitProof: ChainProofChunk[],
	): Promise<TransactionGenerator<"substrate">> {
		let api = await this.api;
		const txs: any[] = [];
		for (let i = 0; i <  exitProof.length; i++) {
			const chunk = exitProof[i];
			const funds = chunk.funds.ordered();
			if(funds.length != 1) throw new Error("expected chunks for substrate to have only one asset per chunk.");
			let [assetID, asset] = funds[0];
			let call: any = {
				epoch: epoch,
				origin: this.chain,
				account: (await this.signer.address()).toJSON(),
				exit_flag: true,

				chunk_index: i,
				chunk_last: exitProof.length-1,

				asset_origin: assetID.origin(),
				asset_type: assetID.type(),
				primary_id: assetID.localID(),
			};

			if(asset instanceof Amount) {
				call.secondary_id = (asset as Amount).toJSON();
			} else {
				if((asset as Tokens).value.length != 1)
					throw new Error(`expected single NFT, got ${
						(asset as Tokens).value.length
					} NFTs in one chunk`);
				call.secondary_id = (asset as Tokens).value[0];
			}

			txs.push(["withdraw", api.tx.erdstall.withdraw(
				call,
				chunk.sig.toBytes())]);
		}

		let chunks = await this.chunk_txs(txs);
		return { stages: this.issueTXs(chunks), numStages: chunks.length };
	}

	private async *issueTXs(
		txs: [StageName<"substrate">, any][]
	): AsyncGenerator<[
		StageName<"substrate">,
		StageTransaction<"substrate">
	], void, void> {
		const api = await(this.api);
		for(let i = 0; i < txs.length; ++i)
		{
			const [name, batch] = txs[i];
			const status = new Promise<void>((accept, reject) => {
				batch.signAndSend(this.signer.keyPair, ({status, events}: {
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
						// TODO: transaction hash or something.
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
	}
}

export function mkDefaultSubstrateSessionConstructor(): {
	backend: "substrate";
	arg: { provider: URL; signer: SubstrateSigner };
	initializer: (c: ClientConfig) => SubstrateSession;
} {
	const ret: {
		backend: "substrate";
		arg: { provider: URL; signer: SubstrateSigner };
		initializer: (c: ClientConfig) => SubstrateSession;
	} = {
		backend: "substrate",
		arg: {
			provider: new URL("wss://rpc-rococo.bajun.network"),
			signer: (() => { throw new Error("not implemented"); })()
		},
		initializer: (_c: ClientConfig) =>
			new SubstrateSession(ret.arg.signer, 1337, ret.arg.provider),
	};
}
