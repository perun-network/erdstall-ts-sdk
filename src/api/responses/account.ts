// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import * as ledger from "#erdstall/ledger";
import { CodecReader, CodecWriter } from "#erdstall/utils";


const accountTypeName = "AccountResponse";

export class Account extends ErdstallObject {
		constructor(
	public account: ledger.Account,
		) { super(); }

	public objectType(): any { return Account; }

	override objectTypeName(): string { return accountTypeName; }

	encode(w: CodecWriter): void { this.account.encode(w); }
	static decode(r: CodecReader): Account
		{ return new Account(ledger.Account.decode(r)); }
}

registerErdstallType(accountTypeName, Account);
