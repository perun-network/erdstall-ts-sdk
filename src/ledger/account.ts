// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonObject,
	jsonMember,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";
import { Assets } from "#erdstall/ledger/assets";

/**
 * Account is the state of a user within Erdstall, including the last nonce and
 * free locked assets. It is returned by an `EnclaveReader.getAccount` query.
 */
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
