// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address, Crypto } from "#erdstall/crypto";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";

const subBPsTypeName = "SubscribeBalanceProofs";
const subTXsTypeName = "SubscribeTXs";
const subPhaseShiftName = "SubscribePhaseShifts";

@jsonObject
export class SubscribeBalanceProofs extends ErdstallObject {
	@jsonMember(Address) who?: Address<Crypto>;
	@jsonMember(Boolean) cancel?: boolean;

	constructor(who?: Address<Crypto>, cancel?: boolean) {
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

	public static fromJSON(json: any): SubscribeBalanceProofs {
		if (!json.who) {
			throw new Error("expected who field in subscribe balance proofs");
		}
		const who = Address.ensure(json.who);
		return new SubscribeBalanceProofs(who, json.cancel);
	}

	public static toJSON(obj: SubscribeBalanceProofs): any {
		return {
			who: obj.who?.toJSON(),
			cancel: obj.cancel,
		};
	}
}

@jsonObject
export class SubscribeTXs extends ErdstallObject {
	@jsonMember who?: Address<Crypto>;
	@jsonMember(Boolean) cancel?: boolean;

	constructor(who?: Address<Crypto>, cancel?: boolean) {
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

	// public static fromJSON(json: any): SubscribeTXs {
	// 	if (!json.who) {
	// 		throw new Error("expected who field in subscribe transaction");
	// 	}
	// 	const who = Address.ensure(json.who);
	// 	return new SubscribeTXs(who, json.cancel);
	// }

	// public static toJSON(obj: SubscribeTXs): any {
	// 	return {
	// 		who: obj.who?.toJSON(),
	// 		cancel: obj.cancel,
	// 	};
	// }
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
