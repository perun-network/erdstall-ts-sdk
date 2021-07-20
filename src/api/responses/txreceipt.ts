// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "#erdstall/api/object";
import { Account } from "#erdstall/ledger";
import { Transaction } from "#erdstall/api/transactions";
import { jsonObject, jsonMember } from "typedjson";

@jsonObject
export class TxReceipt extends ErdstallObject {
	@jsonMember(Transaction) tx: Transaction;
	@jsonMember(Account) account: Account;

	constructor(tx: Transaction, account: Account) {
		super();
		this.tx = tx;
		this.account = account;
	}

	public objectType(): any {
		return TxReceipt;
	}
	protected objectTypeName(): string {
		return "TxReceipt";
	}
}
