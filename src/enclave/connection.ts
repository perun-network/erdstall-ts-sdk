// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address } from "#erdstall/ledger";
import { Call, Result } from "#erdstall/api";
import { EnclaveWatcher, ErdstallEventHandler } from "#erdstall";
import { ErdstallObject } from "#erdstall/api";
import {
	SubscribeTXs,
	SubscribeBalanceProofs,
	GetAccount,
	Onboarding,
} from "#erdstall/api/calls";
import {
	Mint,
	Transfer,
	ExitRequest,
	Trade,
	Burn,
} from "#erdstall/api/transactions";
import {
	ClientConfig,
	TxReceipt,
	BalanceProof,
	BalanceProofs,
	Account,
} from "#erdstall/api/responses";
import { TypedJSON } from "#erdstall/export/typedjson";
import { EventCache, OneShotEventCache } from "#erdstall/utils";
import { EnclaveEvent } from "./event";
import { EnclaveProvider, EnclaveWSProvider } from "./provider";

/**
 * Describes an entity which can build and cut its connection to some target.
 */
export interface Connector {
	connect(): void;
	disconnect(): void;
}

/**
 * Describes the connection a client has to an Enclave running Erdstall.
 */
export interface EnclaveReader extends EnclaveWatcher, Connector {
	/**
	 * Retrieves the account state for the given address within Erdstall.
	 *
	 * @param acc - The address of interest.
	 * @returns A promise containing the state of the account in Erdstall.
	 */
	getAccount(acc: Address): Promise<Account>;
}

export interface EnclaveWriter extends EnclaveReader, Connector {
	/**
	 * Enters Erdstall with the given address.
	 */
	onboard(who: Address): Promise<void>;
	/**
	 * Sends the given transfer transaction to the enclave.
	 *
	 * @param tx - The transfer transaction to send.
	 * @returns A promise containing the transaction receipt for this transfer.
	 */
	transfer(tx: Transfer): Promise<TxReceipt>;
	/**
	 * Sends the given mint transaction to the enclave.
	 *
	 * @param tx - The mint transaction to send.
	 * @returns A promise containing the transaction receipt for this mint.
	 */
	mint(tx: Mint): Promise<TxReceipt>;
	/**
	 * Sends the given burn transaction to the enclave.
	 *
	 * @param tx - The burn transaction to send.
	 * @returns A promise containing the transaction receipt for this burn.
	 */
	burn(tx: Burn): Promise<TxReceipt>;
	/**
	 * Sends the given trade transaction to the enclave.
	 *
	 * @param tx - The trade transaction to send.
	 * @returns A promise containing the transaction receipt for this trade.
	 */
	trade(tx: Trade): Promise<TxReceipt>;
	/**
	 * Sends the given exit request to the enclave.
	 *
	 * @param tx - The exit request to send.
	 * @returns A promise containing the balance proof with its exit flag set.
	 */
	exit(exitRequest: ExitRequest): Promise<BalanceProof>;

	// needed to allow interface checking.
	isEnclaveWriter(): void;
}

export class Enclave implements EnclaveWriter {
	private provider: EnclaveProvider;
	private handlers: EventCache<EnclaveEvent>;
	private oneShotHandlers: OneShotEventCache<EnclaveEvent>;
	private calls: Map<string, [Function, Function]>;
	private id: number;

	static dial(operator: URL): Enclave {
		return new Enclave(new EnclaveWSProvider(operator));
	}

	constructor(provider: EnclaveProvider) {
		this.provider = provider;
		this.handlers = new EventCache<EnclaveEvent>();
		this.oneShotHandlers = new OneShotEventCache<EnclaveEvent>();

		this.calls = new Map<
			string,
			[(val: any) => void, (val: any) => void]
		>();

		this.id = 0;
	}

	public isEnclaveWriter(): void {}

	public connect() {
		this.provider.onmessage = (ev) => this.onMessage(ev);
		this.provider.onerror = (ev) => this.onError(ev);
		this.provider.onopen = (ev) => this.onOpen(ev);
		this.provider.onclose = (ev) => this.onClose(ev);
		this.provider.connect();
	}

	public disconnect() {
		this.provider.close();
	}

	public async onboard(who: Address): Promise<void> {
		const onboard = new Onboarding(who);
		await this.sendCall(onboard);
		return;
	}

	public async subscribe(who?: Address): Promise<void> {
		const subTXs = new SubscribeTXs(who);
		const subBPs = new SubscribeBalanceProofs(who);
		await this.sendCall(subTXs);
		await this.sendCall(subBPs);
		return;
	}

	public async transfer(tx: Transfer): Promise<TxReceipt> {
		return this.sendCall(tx) as Promise<TxReceipt>;
	}

	public async mint(tx: Mint): Promise<TxReceipt> {
		return this.sendCall(tx) as Promise<TxReceipt>;
	}

	public async burn(tx: Burn): Promise<TxReceipt> {
		return this.sendCall(tx) as Promise<TxReceipt>;
	}

	public async trade(tx: Trade): Promise<TxReceipt> {
		return this.sendCall(tx) as Promise<TxReceipt>;
	}

	public async exit(exitRequest: ExitRequest): Promise<BalanceProof> {
		const p = new Promise<BalanceProof>((resolve, reject) => {
			this.once("exitproof", resolve);
			this.sendCall(exitRequest).catch(reject);
		});

		return p;
	}

	public async getAccount(acc: Address): Promise<Account> {
		return this.sendCall(new GetAccount(acc)) as Promise<Account>;
	}

	private async sendCall(data: ErdstallObject): Promise<ErdstallObject> {
		const id = this.nextID().toString();

		const p = new Promise<ErdstallObject>((resolve, reject) => {
			this.calls.set(id, [resolve, reject]);
		});

		const msg = new Call(id, data);
		const wiredata = TypedJSON.stringify(msg, Call);
		this.provider.send(wiredata);

		return p;
	}

	public on<T extends EnclaveEvent>(
		eventType: T,
		cb: ErdstallEventHandler<T>,
	): void {
		this.handlers.set(eventType, cb);
	}

	public once<T extends EnclaveEvent>(
		eventType: T,
		cb: ErdstallEventHandler<T>,
	): void {
		this.oneShotHandlers.set(eventType, cb);
	}

	public off<T extends EnclaveEvent>(
		eventType: T,
		cb: ErdstallEventHandler<T>,
	) {
		this.handlers.delete(eventType, cb);
	}

	public removeAllListeners() {
		this.handlers.clear();
		this.oneShotHandlers.clear();
	}

	private nextID(): number {
		return this.id++;
	}

	private onMessage(ev: MessageEvent) {
		let om: Result | undefined;
		try {
			om = TypedJSON.parse(ev.data, Result);
		} catch {
			console.info("Received unsupported message");
		}

		const msg = om;
		if (!msg) {
			return this.handleUnknownMessage(ev.data);
		}

		if (msg.id) {
			const [resolve, reject] = this.calls.get(msg.id)!;
			this.calls.delete(msg.id);
			if (msg.error) {
				reject(new Error(msg.error));
				return this.callEvent("error", msg.error);
			} else {
				return resolve(msg.data);
			}
		}

		const obj = msg.data!;
		if (obj === undefined) {
			console.info("Received unsupported message from Operator");
			return;
		}

		switch (obj.objectType()) {
			case ClientConfig:
				return this.callEvent("config", obj);
			case TxReceipt:
				return this.callEvent("receipt", obj);
			case BalanceProofs: {
				const bps = obj as BalanceProofs;
				for (const [_, bp] of bps.map) {
					if (bp.balance.exit) {
						this.callEvent("exitproof", bp);
					} else {
						this.callEvent("proof", bp);
					}
				}
				this.callEvent("phaseshift", {} as any);
				break;
			}
			default:
				console.log("Object type: ", obj.objectType());
		}
	}

	private callEvent(ev: EnclaveEvent, payload: any) {
		[this.handlers.get(ev), this.oneShotHandlers.get(ev)].forEach((cbs) => {
			if (!cbs) {
				return;
			}

			cbs.forEach((f) => {
				f(payload);
			});
		});
	}

	private handleUnknownMessage(data: string) {
		console.error(data);
	}

	private onError(ev: Event) {
		console.error("connection error: ", ev);

		this.callEvent("error", new Error("connection error"));

		this.provider.close();
		setTimeout(() => {
			try {
				this.connect();
			} catch {}
		}, 1000);
	}

	private onOpen(_: Event) {
		this.callEvent("open", {} as any);
	}

	private onClose(_: Event) {
		this.callEvent("close", {} as any);
	}
}
