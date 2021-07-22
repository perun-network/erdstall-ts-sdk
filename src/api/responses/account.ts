// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { jsonObject, jsonMember } from "typedjson";
import * as ledger from "#erdstall/ledger";
import { BigInteger } from "#erdstall/api/util";

const accountTypeName = "AccountResponse";

@jsonObject
export class Account extends ErdstallObject {
	@jsonMember(ledger.Account) account: ledger.Account;
	@jsonMember(BigInteger) epoch: BigInteger;

	constructor(account: ledger.Account, epoch: bigint) {
		super();
		this.account = account;
		this.epoch = new BigInteger(epoch);
	}

	public objectType(): any {
		return Account;
	}
	protected objectTypeName(): string {
		return accountTypeName;
	}
}

registerErdstallType(accountTypeName, Account);
