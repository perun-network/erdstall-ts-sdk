// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EnclaveProvider } from "./provider";
import { TypedJSON } from "typedjson";
import { Call, Result, ErdstallObject } from "../api";
import { Subscribe, GetAccount } from "../api/calls";
import * as responses from "../api/responses";
import { Transaction } from "../api/transactions";
import { TxReceipt } from "../api/responses";
import { Mint, Transfer, ExitRequest } from "../api/transactions";
import { Account } from "../ledger/account";
import { Tokens } from "../ledger/assets";
import { Assets } from "../ledger/assets";

export class EnclaveMockProvider implements EnclaveProvider {
	public onopen: ((ev: Event) => any) | null;
	public onclose: ((ev: CloseEvent) => any) | null;
	public onerror: ((ev: Event) => any) | null;
	public onmessage: ((ev: MessageEvent) => any) | null;

	constructor() {
		this.onopen = null;
		this.onclose = null;
		this.onerror = null;
		this.onmessage = null;
	}

	public connect() {}

	public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		const call = TypedJSON.parse(data, Call)!;

		switch (call.data.objectType()) {
			case Subscribe: {
				return this.onmessage!(
					new MessageEvent("erdstall", {
						data: TypedJSON.stringify(new Result(call.id), Result),
					}),
				);
			}
			case GetAccount: {
				return this.onmessage!(
					new MessageEvent("erdstall", {
						data: TypedJSON.stringify(
							new Result(
								call.id,
								new responses.Account(
									new Account(0n, new Assets(), new Assets()),
									0n,
								),
							),
							Result,
						),
					}),
				);
			}
			case Transaction: {
				return this.respondToTX(call.id, call.data as Transaction);
			}
			default:
				throw new Error("message not implemented");
		}
	}

	private respondToTX(id: string, tx: Transaction) {
		switch (tx.txType()) {
			case Transfer: {
				const txc = tx as Transfer;
				return this.onmessage!(
					new MessageEvent("erdstall", {
						data: TypedJSON.stringify(
							new Result(
								id,
								new TxReceipt(
									tx,
									new Account(
										txc.nonce.valueOf(),
										txc.values,
										new Assets(),
									),
								),
							),
							Result,
						),
					}),
				);
			}
			case Mint: {
				const txc = tx as Mint;
				const assets = new Assets();
				assets.addAsset(
					txc.token.toString(),
					new Tokens([txc.id.valueOf()]),
				);
				return this.onmessage!(
					new MessageEvent("erdstall", {
						data: TypedJSON.stringify(
							new Result(
								id,
								new TxReceipt(
									tx,
									new Account(
										txc.nonce.valueOf(),
										assets,
										new Assets(),
									),
								),
							),
							Result,
						),
					}),
				);
			}
			case ExitRequest: {
				const txc = tx as ExitRequest;
				return this.onmessage!(
					new MessageEvent("erdstall", {
						data: TypedJSON.stringify(
							new Result(
								id,
								new TxReceipt(
									tx,
									new Account(
										txc.nonce.valueOf(),
										new Assets(),
										new Assets(),
									),
								),
							),
							Result,
						),
					}),
				);
			}
			default:
				throw new Error("transaction not implemented");
		}
	}

	public sendToClient(obj?: ErdstallObject, id?: string, error?: string) {
		return this.onmessage!(
			new MessageEvent("erdstall", {
				data: TypedJSON.stringify(new Result(id, obj, error), Result),
			}),
		);
	}

	public close() {}
}
