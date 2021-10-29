// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address } from "#erdstall/ledger";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";

const subBPsTypeName = "SubscribeBalanceProofs";
const subTXsTypeName = "SubscribeTXs";

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
		return subBPsTypeName;
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
		return subTXsTypeName;
	}
}

registerErdstallType(subBPsTypeName, SubscribeBalanceProofs);
registerErdstallType(subTXsTypeName, SubscribeTXs);
