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
				const msg = newErdstallMessageEvent(new Result(call.id));
				return this.onmessage!(msg);
			}
			case GetAccount: {
				const acc = new Account(0n, new Assets(), new Assets());
				const racc = new responses.Account(acc, 0n);
				const msg = newErdstallMessageEvent(new Result(call.id, racc));
				return this.onmessage!(msg);
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
				const acc = new Account(
					txc.nonce.valueOf(),
					txc.values,
					new Assets(),
				);

				const res = newTxReceiptResult(id, tx, acc);
				const msg = newErdstallMessageEvent(res);
				return this.onmessage!(msg);
			}
			case Mint: {
				const txc = tx as Mint;
				const assets = new Assets();
				assets.addAsset(
					txc.token.toString(),
					new Tokens([txc.id.valueOf()]),
				);
				const acc = new Account(
					txc.nonce.valueOf(),
					assets,
					new Assets(),
				);

				const res = newTxReceiptResult(id, tx, acc);
				const msg = newErdstallMessageEvent(res);
				return this.onmessage!(msg);
			}
			case ExitRequest: {
				const res = newTxReceiptResult(id, tx);
				const msg = newErdstallMessageEvent(res);
				return this.onmessage!(msg);
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

function newErdstallMessageEvent(res: Result): MessageEvent {
	const data = TypedJSON.stringify(res, Result);
	return new MessageEvent("erdstall", { data: data });
}

function newTxReceiptResult(
	id: string,
	tx: Transaction,
	acc?: Account,
): Result {
	const _acc = acc
		? acc
		: new Account(tx.nonce.valueOf(), new Assets(), new Assets());
	const txr = new TxReceipt(tx, _acc);
	return new Result(id, txr);
}
