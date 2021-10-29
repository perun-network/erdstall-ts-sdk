// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address } from "#erdstall/ledger";

const getAccountTypeName = "GetAccount";

@jsonObject
export class GetAccount extends ErdstallObject {
	@jsonMember(Address) who: Address;

	constructor(who: Address) {
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
