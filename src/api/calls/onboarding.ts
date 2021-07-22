// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, jsonMember } from "typedjson";
import { ErdstallObject } from "#erdstall/api";
import { Address } from "#erdstall/ledger";

@jsonObject
export class Onboarding extends ErdstallObject {
	@jsonMember(Address) who: Address;

	constructor(who: Address) {
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
