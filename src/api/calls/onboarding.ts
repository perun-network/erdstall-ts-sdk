// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ErdstallObject } from "#erdstall/api";
import { Address } from "#erdstall/ledger";
import { Backend } from "#erdstall/ledger/backend";

@jsonObject
export class Onboarding extends ErdstallObject {
	@jsonMember(Address) who: Address<Backend>;

	constructor(who: Address<Backend>) {
		super();
		this.who = who;
	}

	public objectType(): any {
		return Onboarding;
	}
	protected objectTypeName(): string {
		return "Onboarding";
	}
}
