// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonObject,
	jsonMember,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";
import { Assets } from "#erdstall/ledger/assets";

@jsonObject
export class Account {
	@jsonBigIntMember() nonce: bigint;
	@jsonMember(() => Assets) values: Assets;
	@jsonMember(() => Assets) locked: Assets;

	constructor(nonce: bigint, values: Assets, locked?: Assets) {
		this.nonce = nonce;
		this.values = values;
		if (locked === undefined) {
			locked = new Assets();
		}
		this.locked = locked;
	}
}
