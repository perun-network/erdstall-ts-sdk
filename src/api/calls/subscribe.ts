// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address } from "#erdstall/ledger";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";

const subBPsTypeName = "SubscribeBalanceProofs";
const subTXsTypeName = "SubscribeTXs";
const subPhaseShiftName = "SubscribePhaseShifts";

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

@jsonObject
export class SubscribePhaseShifts extends ErdstallObject {
	@jsonMember(Boolean) cancel?: boolean;

	constructor(cancel?: boolean) {
		super();
		this.cancel = cancel;
	}

	public objectType(): any {
		return SubscribePhaseShifts;
	}
	protected objectTypeName(): string {
		return subPhaseShiftName;
	}
}

registerErdstallType(subBPsTypeName, SubscribeBalanceProofs);
registerErdstallType(subTXsTypeName, SubscribeTXs);
registerErdstallType(subPhaseShiftName, SubscribePhaseShifts);
