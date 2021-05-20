// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, jsonMember } from "typedjson";
import { ErdstallObject } from "../object";
import { Address } from "../../ledger";

@jsonObject
export class GetAccount extends ErdstallObject {
	@jsonMember(Address) who: Address;

	constructor(who: Address) {
		super();
		this.who = who;
	}

	protected objectType(): any { return GetAccount; }
	protected objectTypeName(): string { return "GetAccount"; }
}
