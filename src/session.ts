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
	TradeOffer,
	Trade,
	Burn,
} from "#erdstall/api/transactions";
import { InternalEnclaveWatcher } from "./internalenclavewatcher";
import { EnclaveWriter } from "#erdstall/enclave";
import { Account } from "#erdstall/ledger";
import { ChainAssets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import * as crypto from "#erdstall/crypto";
import { EthereumSigner } from "#erdstall/crypto/ethereum";
import { SubstrateSigner } from "#erdstall/crypto/substrate";
import {
	BackendAddress,
	ErdstallBackendSession,
	ErdstallSession,
} from "#erdstall";
import { ErdstallEventHandler } from "./event";
import {
	Client,
	BackendClientConstructors,
} from "./client";
import { TransactionGenerator } from "#erdstall/utils";
import { ReceiptDispatcher } from "./utils/receipt_dispatcher";
import { PendingTransaction } from "./api/util/pending_transaction";
import { Backend, RequestedBackends, Signer } from "#erdstall/ledger/backend";
import { BackendChainConfig } from "#erdstall/ledger/backend/backends";
import { EthereumSession } from "#erdstall/ledger/backend/ethereum";
import { SubstrateSession } from "./ledger/backend/substrate/session";

export const ErrUnitialisedClient = new Error("client unitialised");

// BackendSessionConstructorOverloads is a type-level map of the backend
// session constructors. It might be necessary to have more/additional arguments
// to construct the Session for a specific backend. This struct allows to
// specify these additional arguments.
//
// NOTE: If there is a compiler error here, it is likely that a new backend
// was added and has to be listed here.
export type BackendSessionConstructors = {
	ethereum: {
		type: "ethereum";
		initializer: (
			config: BackendChainConfig<"ethereum">,
			signer: EthereumSigner,
		) => EthereumSession;
	};
	substrate: {
		type: "substrate";
		initializer: (
			config: BackendChainConfig<"substrate">,
			signer: SubstrateSigner,
		) => SubstrateSession;
	};
	test: {
		type: "test";
		initializer: (
			config: BackendChainConfig<"test">,
			signer: Signer<"test">,
		) => ErdstallBackendSession<"test">;
	};
};

export class Session<Bs extends Backend[]>
	extends Client<Bs>
	implements ErdstallSession<Bs>
{
	readonly address: crypto.Address<crypto.Crypto>;
	readonly l2signer: crypto.Signer<crypto.Crypto>;
	private nonce: bigint;
	private readonly enclaveWriter: EnclaveWriter & InternalEnclaveWatcher;
	readonly receiptDispatcher: ReceiptDispatcher;
	// Filled dynamically when we receive configs.
	protected clients: Map<number, ErdstallBackendSession<Bs[number]>>;
	private blockchainWriteCtors: BackendSessionConstructors;

	static async create<Bs extends Backend[]>(
		l2signer: crypto.Signer<crypto.Crypto>,
		enclaveConn: (EnclaveWriter & InternalEnclaveWatcher) | URL,
		backendCtors: BackendSessionConstructors) {
		const addr = await l2signer.address();
		return new Session<Bs>(
			addr,
			l2signer,
			enclaveConn,
			backendCtors);
	}
	private constructor(
		l2address: crypto.Address<crypto.Crypto>,
		l2signer: crypto.Signer<crypto.Crypto>,
		enclaveConn: (EnclaveWriter & InternalEnclaveWatcher) | URL,
		backendCtors: BackendSessionConstructors
	) {
		// NOTE: It is safe to pass no arguments to the super constructor for the
		// client here, since the Session and Client implementation both rely on
		// initializing their backend{client|session} instances upon retrieving the
		// config from the operator.
		super(enclaveConn, {} as BackendClientConstructors);

		this.enclaveWriter = this.enclaveConn as EnclaveWriter &
			InternalEnclaveWatcher;
		// Start with an invalid nonce, so that it will be queried anew
		// upon its next use.
		this.nonce = 0n;
		// When encountering any error, assume it might be a nonce mismatch. In
		// this case, reset the nonce to an invalid value.
		try { this.enclaveWriter.on("error", () => {
			this.nonce = 0n;
		});
		} catch(e) { console.error(this.enclaveWriter, e); }
		this.clients = new Map();
		this.blockchainWriteCtors = backendCtors;
		this.receiptDispatcher = new ReceiptDispatcher();
		this.on_internal(
			"receipt",
			this.receiptDispatcher.watch.bind(this.receiptDispatcher),
		);
		this.l2signer = l2signer;
		this.address = l2address;
	}

	// Queries the next nonce and increases the counter. If the nonce has an
	// invalid value, queries the current nonce from the enclave. This function
	// can be called concurrently.
	private async nextNonce(): Promise<bigint> {
		if (!this.nonce) {
			await this.updateNonce();
		}

		return this.nonce++;
	}

	// Fetches the current nonce from the enclave. Only overwrites the nonce if
	// it has an invalid value, so this function can be called concurrently.
	private async updateNonce(): Promise<void> {
		const acc = await this.enclaveWriter.getAccount(this.address);
		if (!this.nonce) {
			this.nonce = acc.account.nonce + 1n;
		}
	}

	async onboard(): Promise<void> {
		return this.enclaveWriter.onboard(this.address);
	}

	async subscribeSelf(): Promise<void> {
		return this.subscribe(this.address);
	}

	async getOwnAccount(): Promise<Account> {
		return this.getAccount(this.address);
	}

	async transferTo(
		assets: ChainAssets,
		to: crypto.Address<crypto.Crypto>,
	): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Transfer(this.address, nonce, to, assets);
		await tx.sign(this.l2signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.transfer(tx);
		return { receipt, accepted };
	}

	async mint(token: Uint8Array, id: Uint256): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Mint(this.address, nonce, token, id);
		await tx.sign(this.l2signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.mint(tx);
		return { receipt, accepted };
	}

	async burn(assets: ChainAssets): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}

		const nonce = await this.nextNonce();
		const tx = new Burn(this.address, nonce, assets);
		await tx.sign(this.l2signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.burn(tx);
		return { receipt, accepted };
	}

	async exit(): Promise<BalanceProofs> {
		if (!this.initialized) {
			return Promise.reject(ErrUnitialisedClient);
		}

		const exittx = new ExitRequest(
			this.address,
			await this.nextNonce(),
			true,
		);
		await exittx.sign(this.l2signer);
		return this.enclaveWriter.exit(exittx);
	}

	async leave(
		notify?: (message: string, stage: number, maxStages: number) => void,
	): Promise< Map<number, TransactionGenerator<Bs[number]>> > {
		let skipped = 0;
		let cb: ErdstallEventHandler<"phaseshift", never>;
		let atStage = 1;
		let maxStages = 3;
		const p = new Promise<void>((accept) => {
			cb = () => {
				// One Epoch when the current epoch ends for which we receive the ExitProof. (Challenge duration)
				// One further epoch: response duration.
				// One more epoch: Freeze enactment / propagation.
				if (skipped < 3) {
					skipped++;
				} else {
					accept();
				}
			};
			this.on_internal("phaseshift", cb);
		});
		notify?.("awaiting exit proof", atStage++, maxStages);
		const exitProof = (await this.exit()).accounts.get((this.address).key)!;

		notify?.("awaiting epoch sealing", atStage++, maxStages);
		await p.then(() => this.off_internal("phaseshift", cb));
		notify?.("withdrawing", atStage++, maxStages);


		const transactions = new Map<number, TransactionGenerator<Bs[number]>>();
		for(const [address, chains] of exitProof.proofs.entries())
		{
			for(const [chain, proofs] of chains.entries())
			{
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
	): Promise<TransactionGenerator<Bs[number]>> {
		return this.clients.get(chain)!.withdraw(epoch, exitProof);
	}

	async deposit(
		chain: number,
		asset: ChainAssets,
	): Promise<TransactionGenerator<Bs[number]>> {
		return this.clients.get(chain)!.deposit(asset);
	}

	async createOffer(
		offer: ChainAssets,
		expect: ChainAssets,
	): Promise<TradeOffer> {
		const o = new TradeOffer(this.address, offer, expect);
		return o.sign(this.l2signer);
	}

	async acceptTrade(offer: TradeOffer): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Trade(this.address, nonce, offer);
		await tx.sign(this.l2signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.trade(tx);
		return { receipt, accepted };
	}

	private onConfigHandler: ErdstallEventHandler<"config", Bs[number]> = (
		config,
	) => {
		// Construct all requested session backends.
		for (const chainCfg of config.chains) {
			if(!this.blockchainWriteCtors.hasOwnProperty(chainCfg.type))
			{
				console.warn(`No backend configured for ${
						chainCfg.type
					} chain <${
						chainCfg.id
					}>: not creating a backend client.`);
					continue;
			}

			const ctor = this.blockchainWriteCtors[chainCfg.type]!;
			this.clients.set(
				chainCfg.id,
				(ctor.initializer as unknown as any)(chainCfg.data));
		}

		// Forward all cached events to respective clients.
		for (const [_, session] of this.clients) {
			for (const [ev, cbs] of this.erdstallEventHandlerCache) {
				cbs.forEach((cb) => session.on(ev, cb));
			}

			for (const [ev, cbs] of this.erdstallOneShotHandlerCache) {
				cbs.forEach((cb) => session.once(ev, cb));
			}
		}
	};

	initialize(_timeout?: number): Promise<void> {
		return super.initialize(_timeout, this.onConfigHandler);
	}
}
