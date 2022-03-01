// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Account } from "#erdstall/ledger";
import { Transaction } from "#erdstall/api/transactions";
import {
	jsonObject,
	jsonMember,
	jsonMapMember,
	MapShape,
} from "#erdstall/export/typedjson";

const txReceiptTypeName = "TxReceipt";

export enum TxStatusCode {
	Fail = 0,
	Success = 1,
}

@jsonObject
export class TxReceipt extends ErdstallObject {
	@jsonMember(() => Transaction) tx: Transaction;

	@jsonMapMember(String, () => Account, { shape: MapShape.OBJECT })
	delta: Map<string, Account>;
	/**
	 * Erdstall standard status codes can be checked against the enum TxStatusCode
	 */
	@jsonMember(Number) status: Number;
	@jsonMember(String) error?: string;

	constructor(
		tx: Transaction,
		delta: Map<string, Account>,
		status: Number,
		error?: string,
	) {
		super();
		this.tx = tx;
		this.delta = delta;
		this.status = status;
		this.error = error;
	}

	public objectType(): any {
		return TxReceipt;
	}
	protected objectTypeName(): string {
		return txReceiptTypeName;
	}
}

registerErdstallType(txReceiptTypeName, TxReceipt);
