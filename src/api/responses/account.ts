// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "../object";
import { jsonObject, jsonMember } from "typedjson";
import { ledger } from "../..";
import { BigInteger } from "../util";

@jsonObject
export class Account extends ErdstallObject {
	@jsonMember(ledger.Account) account: ledger.Account;
	@jsonMember(BigInteger) epoch: BigInteger;

	constructor(account: ledger.Account, epoch: bigint) {
		super();
		this.account = account;
		this.epoch = new BigInteger(epoch);
	}

	public objectType(): any { return Account; }
	protected objectTypeName(): string { return "AccountResponse"; }
}
