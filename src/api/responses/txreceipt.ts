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

@jsonObject
export class TxReceipt extends ErdstallObject {
	@jsonMember(() => Transaction) tx: Transaction;

	@jsonMapMember(String, () => Account, { shape: MapShape.OBJECT })
	delta: Map<string, Account>;

	constructor(tx: Transaction, delta: Map<string, Account>) {
		super();
		this.tx = tx;
		this.delta = delta;
	}

	public objectType(): any {
		return TxReceipt;
	}
	protected objectTypeName(): string {
		return txReceiptTypeName;
	}
}

registerErdstallType(txReceiptTypeName, TxReceipt);
