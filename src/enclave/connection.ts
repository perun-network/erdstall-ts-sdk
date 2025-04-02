// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address } from "#erdstall/crypto";
import { Call, Result } from "#erdstall/api";
import { ErdstallObject } from "#erdstall/api";
import { EnclaveEventEmitters } from "#erdstall/event";
import {
	SubscribeTXs,
	SubscribeBalanceProofs,
	SubscribePhaseShifts,
	GetAccount,
	Onboarding,
	Attest,
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
	BalanceProofs,
	Account,
	PhaseShift,
	TxAccepted,
	AttestationResult,
	AttestResponse,
} from "#erdstall/api/responses";
import { TypedJSON } from "#erdstall/export/typedjson";
import { EnclaveEvent } from "./event";
import { EnclaveProvider, EnclaveWSProvider } from "./provider";

export class Enclave
{
	#provider: EnclaveProvider;
	#calls = new Map<string, {resolve: Function, reject: Function}>();
	#id: number = 0;

	#opened: boolean = false;
	#globallySubscribed: boolean = false;
	#individuallySubscribed = new Set<Address>();
	#phaseShiftSubscribed: boolean = false;

	#emitters?: EnclaveEventEmitters;
	set emitters(e: EnclaveEventEmitters)
	{
		if(this.#emitters)
			throw new Error("Attempted to override event emitters");
		this.#emitters = e;
	}

	static dial(operator: URL): Enclave
		{ return new Enclave(new EnclaveWSProvider(operator)); }

	constructor(provider: EnclaveProvider)
		{ this.#provider = provider; }

	public isEnclaveWriter(): void {}

	public connect()
	{
		this.#provider.onmessage = (ev) => this.onMessage(ev);
		this.#provider.onerror = (ev) => this.onError(ev);
		this.#provider.onopen = (ev) => this.onOpen(ev);
		this.#provider.onclose = (ev) => this.onClose(ev);
		this.#provider.connect();
	}

	public disconnect()
		{ this.#provider.close(); }

	public async subscribe(who?: Address): Promise<void>
	{
		if (who) {
			this.#individuallySubscribed.add(who);
		} else {
			this.#globallySubscribed = true;
		}

		const subTXs = new SubscribeTXs(who);
		const subBPs = new SubscribeBalanceProofs(who);
		await this.sendCall(subTXs);
		await this.sendCall(subBPs);
		if(!this.#phaseShiftSubscribed)
		{
			this.#phaseShiftSubscribed = true;
			const subPSs = new SubscribePhaseShifts();
			await this.sendCall(subPSs);
		}
		return;
	}

	public async attest(): Promise<AttestationResult> {
		let call = new Attest();
		let res = (await this.sendCall(call)) as AttestResponse;
		if (res.attestation) return res.attestation;
		else throw new Error("attestation not yet issued");
	}

	public async transfer(tx: Transfer): Promise<TxAccepted>
		{ return this.sendCall(tx) as Promise<TxAccepted>; }

	public async mint(tx: Mint): Promise<TxAccepted>
		{ return this.sendCall(tx) as Promise<TxAccepted>; }

	public async burn(tx: Burn): Promise<TxAccepted>
		{ return this.sendCall(tx) as Promise<TxAccepted>; }

	public async trade(tx: Trade): Promise<TxAccepted>
		{ return this.sendCall(tx) as Promise<TxAccepted>; }

	public async exit(exitRequest: ExitRequest): Promise<BalanceProofs> {
		const p = new Promise<BalanceProofs>((resolve, reject) => {
			// NOTE RACE if a proof is received before the exit request is processed. Would need more elaborate logic to harden against that. It would be better to handle tracking of balance proofs in a different manner.
			this.#emitters!.proof.once(resolve);
			this.sendCall(exitRequest).catch(reject);
		});

		return p;
	}

	public async getAccount(acc: Address): Promise<Account>
		{ return this.sendCall(new GetAccount(acc)) as Promise<Account>; }

	private async sendCall(data: ErdstallObject): Promise<ErdstallObject> {
		const id = this.nextID().toString();

		const p = new Promise<ErdstallObject>((resolve, reject) => {
			this.#calls.set(id, {resolve, reject});
		});

		const msg = new Call(id, data);
		const wiredata = TypedJSON.stringify(msg, Call);
		this.#provider.send(wiredata);

		try { return await p; }
		catch(e: unknown) {
			// late error construction improves the stacktrace to something sensible.
			if(typeof e === "string") {
				e = new Error(e);
			} else if(e instanceof Error) {
				e = new Error(e.toString())
			}
			throw e;
		}
	}

	private nextID(): number { return this.#id++; }

	private onMessage(ev: MessageEvent)
	{
		let om: Result | undefined;
		try {
			om = TypedJSON.parse(ev.data, Result);
		} catch {
			console.info("Received unsupported message");
		}

		const msg = om;
		if (!msg) {
			console.error("Unknown message: ", msg);
			return;
		}

		if (msg.id) {
			if(!this.#calls.has(msg.id)) {
				console.error("received message for unknown call ID");
				return;
			}

			const {resolve, reject} = this.#calls.get(msg.id)!;
			this.#calls.delete(msg.id);
			if (msg.error) {
				reject(new Error(msg.error));
				return this.#emitters!.error.emit(msg.error);
			} else {
				return resolve(msg.data);
			}
		} else if(msg.error) {
			console.error("unexpected error:", msg.error);
			this.#emitters!.error.emit(msg.error);
			return;
		}

		const obj = msg.data!;
		if (obj === undefined) {
			console.info("Received unsupported message from Operator");
			return;
		}

		console.log("received event: ", obj.objectTypeName(), obj);

		switch(obj.objectType())
		{
		case ClientConfig:
			this.#emitters!.config.emit(obj as ClientConfig);
			break;
		case TxReceipt:
			this.#emitters!.receipt.emit(obj as TxReceipt);
			break;
		case BalanceProofs:
			this.#emitters!.proof.emit(obj as BalanceProofs);
			break;
		case PhaseShift:
			this.#emitters!.phaseshift.emit(obj as PhaseShift);
			break;
		default:
			console.log("Object type: ", obj.objectType());
		}
	}

	private onError(ev: Event) {
		console.error("connection error: ", ev);

		this.#emitters!.error.emit(new Error("connection error"));

		if(this.#opened) {
			setTimeout(() => {
				try {
					this.connect();
				} catch {}
			}, 1000);
		}

		this.#provider.close();
	}

	private onOpen(_: Event) {
		const calls = [];
		this.#opened = true;
		if (this.#globallySubscribed)
			calls.push(new SubscribeTXs(), new SubscribeBalanceProofs());

		this.#individuallySubscribed.forEach((addr) =>
			calls.push(
				new SubscribeTXs(addr),
				new SubscribeBalanceProofs(addr),
			),
		);

		if(this.#phaseShiftSubscribed) calls.push(new SubscribePhaseShifts());

		this.#emitters!.open.emit();

		calls.forEach((c) => this.sendCall(c));
	}

	private onClose(_: Event) {
		this.#opened = false;
		this.#emitters!.close.emit();
	}
}
