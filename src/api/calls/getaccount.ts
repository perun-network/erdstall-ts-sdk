// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address } from "#erdstall/ledger";
import { Backend } from "#erdstall/ledger/backend";

const getAccountTypeName = "GetAccount";

@jsonObject
export class GetAccount extends ErdstallObject {
	@jsonMember(Address) who: Address<Backend>;

	constructor(who: Address<Backend>) {
		super();
		this.who = who;
	}

	public objectType(): any {
		return GetAccount;
	}
	protected objectTypeName(): string {
		return getAccountTypeName;
	}
}

registerErdstallType(getAccountTypeName, GetAccount);
