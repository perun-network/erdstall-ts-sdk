// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "../object";
import { Address } from "../../ledger";
import { jsonObject, jsonMember } from "typedjson";

@jsonObject
export class SubscribeBalanceProofs extends ErdstallObject {
	@jsonMember(Address) who?: Address;
	@jsonMember(Boolean) cancel?: boolean;

	constructor(who?: Address, cancel?: boolean) {
		super();
		this.who = who;
		this.cancel = cancel;
	}

	public objectType(): any {
		return SubscribeBalanceProofs;
	}
	protected objectTypeName(): string {
		return "SubscribeBalanceProofs";
	}
}

@jsonObject
export class SubscribeTXs extends ErdstallObject {
	@jsonMember(Address) who?: Address;
	@jsonMember(Boolean) cancel?: boolean;

	constructor(who?: Address, cancel?: boolean) {
		super();
		this.who = who;
		this.cancel = cancel;
	}

	public objectType(): any {
		return SubscribeTXs;
	}
	protected objectTypeName(): string {
		return "SubscribeTXs";
	}
}
