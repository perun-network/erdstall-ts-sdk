// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { jsonObject, jsonMember } from "typedjson";
import * as ledger from "#erdstall/ledger";

const accountTypeName = "AccountResponse";

@jsonObject
export class Account extends ErdstallObject {
	@jsonMember(ledger.Account) account: ledger.Account;
	@jsonMember(BigInt) epoch: bigint;

	constructor(account: ledger.Account, epoch: bigint) {
		super();
		this.account = account;
		this.epoch = epoch;
	}

	public objectType(): any {
		return Account;
	}
	protected objectTypeName(): string {
		return accountTypeName;
	}
}

registerErdstallType(accountTypeName, Account);
