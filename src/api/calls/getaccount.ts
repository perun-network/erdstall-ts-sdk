// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address, Crypto } from "#erdstall/crypto";

const getAccountTypeName = "GetAccount";

@jsonObject
export class GetAccount extends ErdstallObject {
	@jsonMember(() => Address) who: Address<Crypto>;

	constructor(who: Address<Crypto>) {
		super();
		this.who = who;
	}

	public objectType(): any {
		return GetAccount;
	}
	override objectTypeName(): string {
		return getAccountTypeName;
	}
}

registerErdstallType(getAccountTypeName, GetAccount);
