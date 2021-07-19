// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address } from "../ledger";
import { Call, Result } from "../api";
import { EnclaveWatcher } from "../";
import { ErdstallObject } from "../api";
import {
	SubscribeTXs,
	SubscribeBalanceProofs,
	GetAccount,
	Onboarding,
} from "../api/calls";
import { Mint, Transfer, ExitRequest } from "../api/transactions";
import {
	ClientConfig,
	TxReceipt,
	BalanceProof,
	BalanceProofs,
	Account,
} from "../api/responses";
import { TypedJSON } from "typedjson";
import EnclaveEvent from "./event";
import { EventCache, OneShotEventCache } from "../utils";
import { EnclaveProvider } from "./provider";

// EnclaveConnection describes the connection a client has to an Enclave
// running Erdstall.
export interface EnclaveConnection extends EnclaveWatcher {
	connect(): void;
	disconnect(): void;
	subscribe(who: Address): Promise<void>;
	onboard(who: Address): Promise<void>;
	transfer(tx: Transfer): Promise<TxReceipt>;
	mint(tx: Mint): Promise<TxReceipt>;
	exit(exitRequest: ExitRequest): Promise<BalanceProof>;
	getAccount(acc: Address): Promise<Account>;
}

export class Enclave implements EnclaveConnection {
	private provider: EnclaveProvider;
	private handlers: EventCache<EnclaveEvent>;
	private oneShotHandlers: OneShotEventCache<EnclaveEvent>;
	private calls: Map<string, [Function, Function]>;
	private id: number;

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

	public async subscribe(who: Address): Promise<void> {
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

	public on(eventType: EnclaveEvent, cb: Function) {
		this.handlers.set(eventType, cb);
	}

	public once(eventType: EnclaveEvent, cb: Function) {
		this.oneShotHandlers.set(eventType, cb);
	}

	public off(eventType: EnclaveEvent, cb: Function) {
		if (!this.handlers.has(eventType)) {
			return;
		}
		const handlers = this.handlers.get(eventType)!;
		const idx = handlers.indexOf(cb);
		if (idx === -1) {
			return;
		}
		for (let i = 0; i < handlers.length; i++) {
			if (i <= idx) {
				continue;
			}
			handlers[i - 1] = handlers[i];
		}
		handlers.pop();
		return;
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
				reject(msg.error);
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
			case BalanceProofs:
				const bps = obj as BalanceProofs;
				for (const [_, bp] of bps.map) {
					if (bp.balance.exit) {
						this.callEvent("exitproof", bp);
					} else {
						this.callEvent("proof", bp);
					}
				}
				break;
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

		this.callEvent("error", {} as any);

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
