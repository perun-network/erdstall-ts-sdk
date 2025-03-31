// SPDX-License-Identifier: Apache-2.0
"use strict";

//import { Signer as EthereumSigner } from "ethers";
import {
	BalanceProofs,
	ChainProof,
	ChainProofChunk,
	ClientConfig,
} from "#erdstall/api/responses";
import {
	Transfer,
	Mint,
	ExitRequest,
	FullExit,
	TradeOffer,
	Trade,
	Burn,
} from "#erdstall/api/transactions";
import { Account, Chain, getChainName } from "#erdstall/ledger";
import { ChainAssets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import * as crypto from "#erdstall/crypto";
import { Signer, Address } from "#erdstall/crypto";
import { EthereumSigner } from "#erdstall/crypto/ethereum";
import { SubstrateSigner } from "#erdstall/crypto/substrate";
import { LedgerEventEmitters, LedgerEventHandlers } from "./event";
import { Enclave, EnclaveEvent } from "#erdstall/enclave";
import { ReceiptDispatcher } from "./utils/receipt_dispatcher";
import { PendingTransaction } from "./api/util/pending_transaction";
import { ChainConfig } from "#erdstall/api/responses";

import { App, AppInternals } from "./app";

import {
	UnsignedTxBatch,
	UnsignedTx,
	SignedTxBatch,
	SignedTx,
	TxReceiptBatch,
	TxReceipt
} from "#erdstall/ledger/backend";

export const ErrUnitialisedClient = new Error("client unitialised");

export abstract class ChainSession {
	abstract withdraw(
		epoch: bigint,
		exitProof: ChainProofChunk[]): Promise<UnsignedTxBatch>;

	abstract deposit(assets: ChainAssets): Promise<UnsignedTxBatch>;

	abstract signTx(tx: UnsignedTx): Promise<SignedTx>;
	abstract signTxBatch(txs: UnsignedTxBatch): Promise<SignedTxBatch>;

	abstract sendTx(tx: SignedTx): Promise<TxReceipt>;
	abstract sendTxBatch(txs: SignedTxBatch): Promise<TxReceiptBatch>;

}


export type BackendSessionConstructors = {
	ethereum: {
		type: "ethereum";
		initializer: (
			config: ChainConfig,
			signer: EthereumSigner,
		) => ChainSession;
	};
	substrate: {
		type: "substrate";
		initializer: (
			config: ChainConfig,
			signer: SubstrateSigner,
		) => ChainSession;
	};
};

// L2-only read-write client that is associated with an L2 account.
export class WritingApp extends App {
	// L2 signing and nonce tracking.
	#l2signer: Signer;

	#internals: AppInternals;

	// Start with an invalid nonce, so that it will be queried anew upon its next use.
	#nonce: bigint = 0n;
	#updatingNonce?: Promise<any>;
	#receiptDispatcher = new ReceiptDispatcher;

	get #enclave() { return this.#internals.enclave!; }
	get address(): Address { return this.#l2signer.address(); }

	constructor(
		enclaveConn: Enclave | URL,
		l2_signer: Signer,
		blockchainCtors: BackendSessionConstructors,
		internals?: AppInternals)
	{
		internals ??= new AppInternals;
		super(enclaveConn, internals);

		this.#internals = internals;
		this.#internals.l2.error.on(() => { this.#nonce = 0n; });
		this.#internals.l2.receipt.on((r) => this.#receiptDispatcher.watch(r));
		this.#l2signer = l2_signer;
	}

	async transferTo(
		assets: ChainAssets,
		to: Address,
	): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.#nextNonce();
		const tx = new Transfer(this.address, nonce, to, assets);
		await tx.sign(this.#l2signer);
		const hash = tx.hash();
		const receipt = this.#receiptDispatcher.register(hash);
		const accepted = this.#enclave.transfer(tx);
		return { receipt, accepted };
	}

	async mint(token: Uint8Array, id: Uint256): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.#nextNonce();
		const tx = new Mint(this.address, nonce, token, id);
		await tx.sign(this.#l2signer);
		const hash = tx.hash();
		const receipt = this.#receiptDispatcher.register(hash);
		const accepted = this.#enclave.mint(tx);
		return { receipt, accepted };
	}

	async burn(assets: ChainAssets): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}

		const nonce = await this.#nextNonce();
		const tx = new Burn(this.address, nonce, assets);
		await tx.sign(this.#l2signer);
		const hash = tx.hash();
		const receipt = this.#receiptDispatcher.register(hash);
		const accepted = this.#enclave.burn(tx);
		return { receipt, accepted };
	}

	async createOffer(
		offer: ChainAssets,
		expect: ChainAssets,
	): Promise<TradeOffer> {
		const o = new TradeOffer(this.address, offer, expect);
		return o.sign(this.#l2signer);
	}

	async acceptTrade(offer: TradeOffer): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.#nextNonce();
		const tx = new Trade(this.address, nonce, offer);
		await tx.sign(this.#l2signer);
		const hash = tx.hash();
		const receipt = this.#receiptDispatcher.register(hash);
		const accepted = this.#enclave.trade(tx);
		return { receipt, accepted };
	}

	async exit(chain?: number): Promise<BalanceProofs> {
		if (!this.initialized) {
			return Promise.reject(ErrUnitialisedClient);
		}

		const exittx = new ExitRequest(
			this.address,
			await this.#nextNonce(),
			true,
			new FullExit(chain, false)
		);
		await exittx.sign(this.#l2signer);
		return this.#enclave.exit(exittx);
	}


	// Queries the next nonce and increases the counter. If the nonce has an
	// invalid value, queries the current nonce from the enclave. This function
	// can be called concurrently.
	async #nextNonce(): Promise<bigint> {
		if (!this.#nonce) {
			await this.updateNonce();
		}

		return this.#nonce++;
	}

	async #updateNonceInternal(): Promise<void> {
		const acc = await this.#enclave.getAccount(this.address);
		if (!this.#nonce) {
			this.#nonce = acc.account.nonce + 1n;
		}
	}

	// Fetches the current nonce from the enclave. Only overwrites the nonce if
	// it has an invalid value, so this function can be called concurrently.
	async updateNonce(): Promise<void> {
		if(this.#updatingNonce) return this.#updatingNonce;
		this.#updatingNonce = this.#updateNonceInternal();
		await this.#updatingNonce;
		this.#updatingNonce = undefined;
	}

	async subscribeSelf(): Promise<void> {
		return this.#enclave.subscribe(this.address);
	}

	async getOwnAccount(): Promise<Account> {
		return this.getAccount(this.address);
	}
}

export class Session extends WritingApp
{
	#internals: AppInternals;

	#l2_signer: Signer;
	#address: Address;
	get address(): Address { return this.#address; }

	get #enclave() { return this.#internals.enclave!; }
	// Filled dynamically when we receive configs.
	#chains = new Map<Chain, ChainSession>();
	#blockchainWriteCtors: BackendSessionConstructors;
	#receiptDispatcher = new ReceiptDispatcher();


	// Event handling.
	#l1_event_emitters = new LedgerEventEmitters;
	#internal_l1_events: LedgerEventHandlers =
		new LedgerEventHandlers(this.#l1_event_emitters);
	get l1_events(): LedgerEventHandlers
		{ return new LedgerEventHandlers(this.#l1_event_emitters); }

	constructor(
		l2signer: Signer,
		enclaveConn: Enclave | URL,
		backendCtors: BackendSessionConstructors
	) {
		const internals = new AppInternals((cfg) => this.#on_config(cfg));
		super(enclaveConn, l2signer, backendCtors, internals);
		this.#internals = internals;

		this.#l2_signer = l2signer;
		this.#address = l2signer.address();
		this.#blockchainWriteCtors = backendCtors;
		this.#internals.l2.receipt.on((e) => this.#receiptDispatcher.watch(e));
	}

	async leave(
		chain?: number,
		notify?: (message: string, stage: number, maxStages: number) => void,
	): Promise< Map<number, UnsignedTxBatch> > {
		let skipped = 0;
		let atStage = 1;
		let maxStages = 3;
		const sealed = new Promise<void>((accept) => {
			let cb = () => {
				// One Epoch when the current epoch ends for which we receive the ExitProof. (Challenge duration)
				// One further epoch: response duration.
				// One more epoch: Freeze enactment / propagation.
				if (skipped < 3) {
					skipped++;
				} else {
					this.#internals.l2.phaseshift.off(cb);
					accept();
				}
			};
			// NOTE IMPROVE: unreliable if we are at an epoch shift. We should get the epoch the transaction happened in as part of the TX receipt to be completely race-free. And then we want to await for the balance proofs etc. Also, instead of awaiting phaseshift events, we would rather wait for a timestamp according to our time. That way, the phaseshift event becomes more of a "we just persisted" notification or something, but no longer required for this kind of stuff.
			this.#internals.l2.phaseshift.on(cb);
		});
		notify?.("awaiting exit proof", atStage++, maxStages);
		const exitProof = (await this.exit(chain)).accounts.get((this.address).key)!;

		notify?.("awaiting epoch sealing", atStage++, maxStages);
		await sealed;
		notify?.("withdrawing", atStage++, maxStages);


		const transactions = new Map<number, UnsignedTxBatch>();
		for(const [address, chains] of exitProof.proofs.entries())
		{
			for(let [chain, proofs] of chains.entries())
			{
				chain = Number(chain);
				transactions.set(chain, await this.withdraw(
					chain,
					exitProof.epoch,
					proofs.exit));
			}
		}
		return transactions;
	}

	async withdraw(
		chain: number,
		epoch: bigint,
		exitProof: ChainProofChunk[],
	): Promise<UnsignedTxBatch> {
		return this.#chains.get(chain)!.withdraw(epoch, exitProof);
	}

	async deposit(
		chain: number,
		asset: ChainAssets,
	): Promise<UnsignedTxBatch> {
		return this.#chains.get(chain)!.deposit(asset);
	}

	async signTx(tx: UnsignedTx): Promise<SignedTx>
	{
		const chain = this.#chains.get(tx.chain);
		if(!chain)
			throw new Error(`Transaction is for unsupported chain ${
				getChainName(tx.chain)
			}`);

		return await chain.signTx(tx);
	}

	async signTxBatch(txs: UnsignedTxBatch): Promise<SignedTxBatch> {
		const chain = this.#chains.get(txs.chain);
		if(!chain)
			throw new Error(`Transaction batch is for unsupported chain ${
				getChainName(txs.chain)
			}`);

		return await chain.signTxBatch(txs);
	}

	async sendTx(tx: SignedTx): Promise<TxReceipt> {
		const chain = this.#chains.get(tx.chain);
		if(!chain)
			throw new Error(`Transaction is for unsupported chain ${
				getChainName(tx.chain)
			}`);

		return await chain.sendTx(tx);
	}

	async sendTxBatch(txs: SignedTxBatch): Promise<TxReceiptBatch> {
		const chain = this.#chains.get(txs.chain);
		if(!chain)
			throw new Error(`Transaction batch is for unsupported chain ${
				getChainName(txs.chain)
			}`);

		return await chain.sendTxBatch(txs);
	}

	#on_config(cfg: ClientConfig): void
	{
		// Construct all requested session backends.
		for (const chainCfg of cfg.chains) {
			if(!this.#blockchainWriteCtors.hasOwnProperty(chainCfg.data.type()))
			{
				console.warn(`No backend configured for ${
						chainCfg.data.type()
					} chain <${
						chainCfg.id
					}>: not creating a backend client.`);
					continue;
			}

			if(this.#address.type() !== chainCfg.data.type())
			{
				console.warn(`No compatible signer for ${
						chainCfg.data.type()
					} chain <${
						chainCfg.id
					}>: not creating a backend client.`);
				continue;
			}

			const ctor = (this.#blockchainWriteCtors as any)[chainCfg.data.type()]!;
			this.#chains.set(
				chainCfg.id,
				(ctor.initializer as unknown as any)(
					chainCfg,
					this.#l2_signer,
					this.#l1_event_emitters) as ChainSession);
		}
	};
}
