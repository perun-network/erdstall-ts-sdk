// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "../object";
import { Address } from "../../ledger";
import { jsonObject, jsonMember } from "typedjson";

@jsonObject
export class Subscribe extends ErdstallObject {
	@jsonMember(Address) who: Address;

	constructor(who: Address) {
		super();
		this.who = who;
	}

	protected objectType(): any { return Subscribe; }
	protected objectTypeName(): string { return "Subscribe"; }
}
