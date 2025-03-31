// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ErdstallObject } from "#erdstall/api";
import { Address, Crypto } from "#erdstall/crypto";

@jsonObject
export class Onboarding extends ErdstallObject {
	@jsonMember(() => Address) who: Address<Crypto>;

	constructor(who: Address<Crypto>) {
		super();
		this.who = who;
	}

	public objectType(): any {
		return Onboarding;
	}
	override objectTypeName(): string {
		return "Onboarding";
	}
}
