// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer as EthereumSigner } from "ethers";
import { BalanceProof, ClientConfig } from "#erdstall/api/responses";
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
import { Address, Account } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import { ErdstallBackendSession, ErdstallSession } from "#erdstall";
import { ErdstallEventHandler } from "./event";
import {
	Client,
	BackendClientConstructors,
	ConstructorArgs as ClientConstructorArgs,
} from "./client";
import { TransactionGenerator } from "#erdstall/utils";
import { ReceiptDispatcher } from "./utils/receipt_dispatcher";
import { PendingTransaction } from "./api/util/pending_transaction";
import { Backend, RequestedBackends, Signer } from "#erdstall/ledger/backend";
import { EthereumSession } from "#erdstall/ledger/backend/ethereum";
import { SubstrateSession } from "./ledger/backend/substrate/session";

export const ErrUnitialisedClient = new Error("client unitialised");

// The backend session constructors used to construct sessions for specific
// backends. They naturally extend the type of `BackendClientConstructors`
// since a `Client` of a specific backend is the super type of its session.
type BackendSessionConstructors = {
	[K in keyof BackendClientConstructors]: UnifyTypes<
		{
			[V in keyof BackendClientConstructors[K]]: BackendClientConstructors[K][V];
		},
		BackendSessionConstructorOverloads[K]
	>;
};

// BackendSessionConstructorOverloads is a type-level map of the backend
// session constructors. It might be necessary to have more/additional arguments
// to construct the Session for a specific backend. This struct allows to
// specify these additional arguments.
//
// NOTE: If there is a compiler error here, it is likely that a new backend
// was added and has to be listed here.
type BackendSessionConstructorOverloads = {
	ethereum: {
		signer: EthereumSigner;
		initializer: (
			config: ClientConfig,
			signer: EthereumSigner,
		) => EthereumSession;
	};
	substrate: {};
};

// UnifyTypes creates a type-level union of the types of two objects. If keys
// are matching, the type of the second object is used.
//
// Example:
//  type A = { a: string, b: number }
//  type B = { c: boolean, d: bigint }
//  type C = UnifyTypes<A, B>
//  // C = { a: string, b: number, c: boolean, d: bigint }
//  type D = { a: number }
//  type E = UnifyTypes<A, D>
//  // E = { a: number, b: number }
type UnifyTypes<T, U> = {
	[K in keyof T | keyof U]: K extends keyof U
		? U[K]
		: K extends keyof T
		? T[K]
		: never;
};

// ConstructorArgs creates a type-level tuple of the backends constructors
// used with this client.
type ConstructorArgs<Bs extends Backend[]> = Bs extends [
	infer Head,
	...infer Rest,
]
	? Head extends Backend
		? Rest extends Backend[]
			? [BackendSessionConstructors[Head], ...ConstructorArgs<Rest>]
			: never
		: never
	: [];

function createSession<Bs extends Backend[]>(
	config: ClientConfig,
	backendCtor: BackendSessionConstructors[keyof BackendSessionConstructors],
): ErdstallBackendSession<Bs[number]> {
	switch (backendCtor.backend) {
		case "ethereum":
			return backendCtor.initializer(config, backendCtor.signer);
		case "substrate":
			return new SubstrateSession(420);
	}
}

export class Session<Bs extends Backend[]>
	extends Client<Bs>
	implements ErdstallSession<Bs>
{
	readonly address: Address<Bs[number]>;
	readonly signer: Signer<Bs[number]>;
	private nonce: bigint;
	private readonly enclaveWriter: EnclaveWriter & InternalEnclaveWatcher;
	readonly receiptDispatcher: ReceiptDispatcher;
	protected clients: Map<Bs[number], ErdstallBackendSession<Bs[number]>>;

	private sessionArgs: ConstructorArgs<Bs>;

	constructor(
		address: Address<Bs[number]>,
		enclaveConn: (EnclaveWriter & InternalEnclaveWatcher) | URL,
		signer: Signer<Bs[number]>,
		...args: ConstructorArgs<Bs>
	) {
		// NOTE: It is safe to pass no arguments to the super constructor for the
		// client here, since the Session and Client implementation both rely on
		// initializing their backend{client|session} instances upon retrieving the
		// config from the operator.
		super(enclaveConn, ...([] as ClientConstructorArgs<Bs>));

		this.enclaveWriter = this.enclaveConn as EnclaveWriter &
			InternalEnclaveWatcher;
		this.address = address;
		// Start with an invalid nonce, so that it will be queried anew
		// upon its next use.
		this.nonce = 0n;
		// When encountering any error, assume it might be a nonce mismatch. In
		// this case, reset the nonce to an invalid value.
		this.enclaveWriter.on("error", () => {
			this.nonce = 0n;
		});
		this.clients = new Map();
		this.sessionArgs = args;
		this.receiptDispatcher = new ReceiptDispatcher();
		this.on_internal(
			"receipt",
			this.receiptDispatcher.watch.bind(this.receiptDispatcher),
		);
		this.signer = signer;
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
		assets: Assets,
		to: Address<Backend>,
	): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Transfer(this.address, nonce, to, assets);
		await tx.sign(this.signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.transfer(tx);
		return { receipt, accepted };
	}

	async mint(
		token: Address<Backend>,
		id: Uint256,
	): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Mint(this.address, nonce, token, id);
		await tx.sign(this.signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.mint(tx);
		return { receipt, accepted };
	}

	async burn(assets: Assets): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}

		const nonce = await this.nextNonce();
		const tx = new Burn(this.address, nonce, assets);
		await tx.sign(this.signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.burn(tx);
		return { receipt, accepted };
	}

	async exit(): Promise<BalanceProof> {
		if (!this.initialized) {
			return Promise.reject(ErrUnitialisedClient);
		}

		const exittx = new ExitRequest(this.address, await this.nextNonce());
		await exittx.sign(this.signer);
		return this.enclaveWriter.exit(exittx);
	}

	async leave<B extends RequestedBackends<Bs>>(
		backend: B,
		notify?: (message: string, stage: number, maxStages: number) => void,
	): Promise<TransactionGenerator> {
		let skipped = 0;
		let cb: ErdstallEventHandler<"phaseshift", never>;
		let atStage = 1;
		let maxStages = 3;
		const p = new Promise<void>((accept) => {
			cb = () => {
				// One Epoch when the current epoch ends for which we receive the ExitProof.
				// One more Epoch to guarantee that our ExitProof is part of a sealed epoch.
				if (skipped < 2) {
					skipped++;
				} else {
					accept();
				}
			};
			this.on_internal("phaseshift", cb);
		});
		notify?.("awaiting exit proof", atStage++, maxStages);
		const exitProof = await this.exit();
		notify?.("awaiting epoch sealing", atStage++, maxStages);
		await p.then(() => this.off_internal("phaseshift", cb));
		notify?.("withdrawing", atStage++, maxStages);
		return this.withdraw(backend, exitProof);
	}

	async withdraw<B extends RequestedBackends<Bs>>(
		_backend: B,
		_exitProof: BalanceProof,
	): Promise<TransactionGenerator> {
		throw new Error("not implemented");
	}

	async deposit<B extends RequestedBackends<Bs>>(
		_backend: B,
		_asset: Assets,
	): Promise<TransactionGenerator> {
		throw new Error("not implemented");
	}

	async createOffer(offer: Assets, expect: Assets): Promise<TradeOffer> {
		const o = new TradeOffer(this.address, offer, expect);
		return o.sign(this.signer);
	}

	async acceptTrade(offer: TradeOffer): Promise<PendingTransaction> {
		if (!this.initialized) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Trade(this.address, nonce, offer);
		await tx.sign(this.signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.trade(tx);
		return { receipt, accepted };
	}

	private onConfigHandler: ErdstallEventHandler<"config", Bs[number]> = (
		config,
	) => {
		// Construct all requested session backends.
		for (const backendCtor of this.sessionArgs) {
			const session = createSession(config, backendCtor);
			let _backendCtor = backendCtor as { backend: Bs[number] };
			this.clients.set(_backendCtor.backend, session);
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
		return super.initialize(undefined, this.onConfigHandler);
	}
}
