// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address, Crypto } from "#erdstall/crypto";
import { CodecReader, CodecWriter } from "#erdstall/utils";

const subBPsTypeName = "SubscribeBalanceProofs";
const subTXsTypeName = "SubscribeTXs";
const subPhaseShiftName = "SubscribePhaseShifts";

export class SubscribeBalanceProofs extends ErdstallObject {
		constructor(
	public who: Address,
	public cancel: boolean = false
		) { super(); }

	override objectType(): any { return SubscribeBalanceProofs; }
	override objectTypeName(): string { return subBPsTypeName; }

	override encode(w: CodecWriter): void {
		Address.encode(w, this.who);
		w.bool(this.cancel);
	}
	static decode(r: CodecReader): SubscribeBalanceProofs {
		return new SubscribeBalanceProofs(
			Address.decode(r),
			r.bool());
	}
}

export class SubscribeTXs extends ErdstallObject {
		constructor(
	public who?: Address,
	public cancel: boolean = false
		) { super(); }

	override objectType(): any { return SubscribeTXs; }
	override objectTypeName(): string { return subTXsTypeName; }

	override encode(w: CodecWriter): void {
		w.opt(this.who);
		w.bool(this.cancel);
	}
	static decode(r: CodecReader): SubscribeTXs
		{ return new SubscribeTXs(r.opt(() => Address.decode(r)), r.bool()); }
}

export class SubscribePhaseShifts extends ErdstallObject {
		constructor(
	public cancel: boolean = false
		) { super(); }

	override objectType(): any { return SubscribePhaseShifts; }
	override objectTypeName(): string { return subPhaseShiftName; }

	override encode(w: CodecWriter): void { w.bool(this.cancel); }
	static decode(r: CodecReader): SubscribePhaseShifts
		{ return new SubscribePhaseShifts(r.bool()); }
}

registerErdstallType(subBPsTypeName, SubscribeBalanceProofs);
registerErdstallType(subTXsTypeName, SubscribeTXs);
registerErdstallType(subPhaseShiftName, SubscribePhaseShifts);
