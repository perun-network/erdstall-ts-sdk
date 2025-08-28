// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address, SigVerifier } from "#erdstall/crypto";
import { Call, Result } from "#erdstall/api";
import { ErdstallObject } from "#erdstall/api";
import { EnclaveEventEmitters } from "#erdstall/event";
import {
	SubscribeTXs,
	SubscribeBalanceProofs,
	SubscribePhaseShifts,
} from "#erdstall/api/calls";
import {
	SignedTransaction,
	Mint,
	Transfer,
	FullExit,
	Burn,
	SetPrivacy,
	SetPrivacy_Output,
	LinkAccount,
	LinkAccount_Output,
	GetAccount,
	GetAccount_Output,
} from "#erdstall/api/transactions";
import {
	ClientConfig,
	DirectTxReceipt,
	SignedDirectTxReceipt,
	PublicTxReceipt,
	SignedPublicTxReceipt,
	SignedBalanceProof,
	BalanceProof,
	Account,
	PhaseShift,
} from "#erdstall/api/responses";
import { TypedJSON } from "#erdstall/export/typedjson";
import { EnclaveEvent } from "./event";
import { EnclaveProvider, EnclaveWSProvider } from "./provider";

export class CallResponse<T = any> {
	constructor(
		public accepted: Promise<void>,
		public result: Promise<T>,
	) { }

	map<U>(fn: (v: T) => Promise<U>): CallResponse<U> {
		return new CallResponse<U>(
			this.accepted,
			(async (): Promise<U> => {
				return await fn(await this.result);
			})(),
		);
	}
}

class CallPromise<T extends ErdstallObject = ErdstallObject> {
	constructor(
		public acknowledged: () => void,
		public success: (v: T) => void,
		public error: (e: Error) => void,
	) { }

	static make<T extends ErdstallObject = ErdstallObject>(): {
		handlers: CallPromise<T>;
		response: CallResponse<T>;
	} {
		let result_acc: (v: T) => void;
		let result_rej: (e: Error) => void;
		const result = new Promise<T>((res_acc, res_rej) => {
			result_acc = res_acc;
			result_rej = res_rej;
		});
		let ack_acc: () => void;
		let ack_rej: (e: Error) => void;
		const ack = new Promise<void>((acc, rej) => {
			ack_acc = acc;
			ack_rej = rej;
		});

		return {
			handlers: new CallPromise<T>(
				ack_acc!,
				(v: T) => {
					ack_acc();
					result_acc(v);
				},
				(e: Error) => {
					ack_rej(e);
					result_rej(e);
				},
			),
			response: new CallResponse(ack, result),
		};
	}
}

export class Enclave {
	#provider: EnclaveProvider;
	#calls = new Map<number, CallPromise<ErdstallObject>>();
	#id: number = 0;

	#opened: boolean = false;
	#globallySubscribed: boolean = false;
	#individuallySubscribed = new Set<Address>();
	#phaseShiftSubscribed: boolean = false;

	#emitters?: EnclaveEventEmitters;
	#sigVerifier?: SigVerifier;
	set emitters([e, vrfy]: [EnclaveEventEmitters, SigVerifier]) {
		if (this.#emitters || this.#sigVerifier)
			throw new Error("Attempted to override event emitters");
		this.#emitters = e;
		this.#sigVerifier = vrfy;
	}

	static dial(operator: URL): Enclave {
		return new Enclave(new EnclaveWSProvider(operator));
	}

	constructor(provider: EnclaveProvider) {
		this.#provider = provider;
	}

	public isEnclaveWriter(): void { }

	public connect() {
		this.#provider.onmessage = (ev) => this.onMessage(ev);
		this.#provider.onerror = (ev) => this.onError(ev);
		this.#provider.onopen = (ev) => this.onOpen(ev);
		this.#provider.onclose = (ev) => this.onClose(ev);
		this.#provider.connect();
	}

	public disconnect() {
		this.#provider.close();
	}

	public async subscribe(who?: Address): Promise<void> {
		// TODO: this is quite brittle, it is currently only really tested for single accounts. We also assume that all balance proofs we receive are for our owned account when exiting.
		if (who) {
			this.#individuallySubscribed.add(who);
		} else {
			this.#globallySubscribed = true;
		}

		await this.sendCall(new SubscribeTXs(who)).result;
		if (who) await this.sendCall(new SubscribeBalanceProofs(who)).result;

		if (!this.#phaseShiftSubscribed) {
			this.#phaseShiftSubscribed = true;
			const subPSs = new SubscribePhaseShifts();
			await this.sendCall(subPSs).result;
		}
		return;
	}

	/*public async attest(): Promise<AttestationResult> {
		let call = new Attest();
		let res = (await this.sendCall(call)) as AttestResponse;
		if (res.attestation) return res.attestation;
		else throw new Error("attestation not yet issued");
	}*/

	public transfer(tx: SignedTransaction<Transfer>): CallResponse<void> {
		return this.sendCall<SignedDirectTxReceipt>(tx).map(async (r) => {
			(await r.verify(this.#sigVerifier!))!.ok();
		});
	}

	public mint(tx: SignedTransaction<Mint>): CallResponse<void> {
		return this.sendCall<SignedDirectTxReceipt>(tx).map(async (r) => {
			(await r.verify(this.#sigVerifier!))!.ok();
		});
	}

	public burn(tx: SignedTransaction<Burn>): CallResponse<void> {
		return this.sendCall<SignedDirectTxReceipt>(tx).map(async (r) => {
			(await r.verify(this.#sigVerifier!))!.ok();
		});
	}

	public exit(exitRequest: SignedTransaction<FullExit>): {
		response: CallResponse<void>;
		proof: Promise<BalanceProof>;
	} {
		let response = this.sendCall<SignedDirectTxReceipt>(exitRequest).map(
			async (r) => {
				(await r.verify(this.#sigVerifier!))!.ok();
			},
		);
		const proof = new Promise<BalanceProof>((resolve, reject) => {
			// NOTE RACE if a proof is received before the exit request is processed. Would need more elaborate logic to harden against that. It would be better to handle tracking of balance proofs in a different manner.
			this.#emitters!.proof.once(resolve);
			response.result.catch(reject);
		});

		return { response, proof };
	}

	public getAccount(
		tx: SignedTransaction<GetAccount>,
	): CallResponse<GetAccount_Output> {
		return this.sendCall<SignedDirectTxReceipt>(tx).map(async (r) =>
			GetAccount_Output.decode(
				(await r.verify(this.#sigVerifier!))!.ok().reader(),
			),
		);
	}

	public setPrivacy(
		tx: SignedTransaction<SetPrivacy>,
	): CallResponse<SetPrivacy_Output> {
		return this.sendCall<SignedDirectTxReceipt>(tx).map(async (r) =>
			SetPrivacy_Output.decode(
				(await r.verify(this.#sigVerifier!))!.ok().reader(),
			),
		);
	}

	public linkAccount(
		tx: SignedTransaction<LinkAccount>,
	): CallResponse<LinkAccount_Output> {
		return this.sendCall<SignedDirectTxReceipt>(tx).map(async (r) =>
			LinkAccount_Output.decode(
				(await r.verify(this.#sigVerifier!))!.ok().reader(),
			),
		);
	}

	private sendCall<T extends ErdstallObject = ErdstallObject>(
		data: ErdstallObject,
	): CallResponse<T> {
		const id = this.nextID();

		const { handlers, response } = CallPromise.make<T>();
		// We lose some type precision here but that's OK.
		this.#calls.set(id, handlers as CallPromise<ErdstallObject>);

		const msg = new Call(id, data);
		const wiredata = TypedJSON.stringify(msg, Call);
		this.#provider.send(wiredata);

		return response;

		// Disabled: doesn't fit the multi-response / ack+response model anymore.
		/*try { return await p; }
		catch(e: unknown) {
			// late error construction improves the stacktrace to something sensible.
			if(typeof e === "string") {
				e = new Error(e);
			} else if(e instanceof Error) {
				e = new Error(e.toString())
			}
			throw e;
		}*/
	}

	private nextID(): number {
		return this.#id++;
	}

	private async onMessage(ev: MessageEvent) {
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

		// handle responses.
		if (msg.id) {
			if (!this.#calls.has(msg.id)) {
				console.error("received message for unknown call ID");
				return;
			}

			const call = this.#calls.get(msg.id)!;
			if (!msg.isPending())
				// is this a "pending" message or an actual result?
				this.#calls.delete(msg.id);

			if (msg.error) {
				call.error(new Error(msg.error));
				this.#emitters!.error.emit(msg.error);
			} else {
				if (msg.isPending()) call.acknowledged();
				else call.success(msg.data as any);
			}
			return;
		} else if (msg.error) {
			console.error("unexpected error:", msg.error);
			this.#emitters!.error.emit(msg.error);
			return;
		}

		const obj = msg.data!;
		if (obj === undefined) {
			console.info("Received unsupported message from Operator");
			return;
		}

		// handle push-messages.

		console.log("received event: ", obj.objectTypeName(), obj);

		switch (obj.objectType()) {
			case ClientConfig:
				this.#emitters!.config.emit(obj as ClientConfig);
				break;
			case SignedPublicTxReceipt:
				this.#emitters!.receipt.emit([
					(obj as SignedPublicTxReceipt).target,
					(await (obj as SignedPublicTxReceipt).verify(this.#sigVerifier!))!,
				]);
				break;
			case SignedBalanceProof:
				this.#emitters!.proof.emit(
					(await (obj as SignedBalanceProof).verify(this.#sigVerifier!))!,
				);
				break;
			case PhaseShift:
				this.#emitters!.phaseshift.emit(obj as PhaseShift);
				break;
			default:
				console.warn("Unhandled Object type: ", obj.objectType());
		}
	}

	private onError(ev: Event) {
		console.error("connection error: ", ev);

		this.#emitters!.error.emit(new Error("connection error"));

		if (this.#opened) {
			setTimeout(() => {
				try {
					this.connect();
				} catch { }
			}, 1000);
		}

		this.#provider.close();
	}

	private onOpen(_: Event) {
		const calls = [];
		this.#opened = true;
		if (this.#globallySubscribed) calls.push(new SubscribeTXs());

		this.#individuallySubscribed.forEach((addr) =>
			calls.push(new SubscribeTXs(addr), new SubscribeBalanceProofs(addr)),
		);

		if (this.#phaseShiftSubscribed) calls.push(new SubscribePhaseShifts());

		this.#emitters!.open.emit();

		calls.forEach((c) => this.sendCall(c));
	}

	private onClose(_: Event) {
		this.#opened = false;
		this.#emitters!.close.emit();
	}
}
