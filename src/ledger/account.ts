// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, jsonMember } from "typedjson";
import { BigInteger } from "#erdstall/api/util";
import { Assets } from "#erdstall/ledger/assets";

@jsonObject
export class Account {
	@jsonMember(BigInteger) nonce: BigInteger;
	@jsonMember(Assets) values: Assets;
	@jsonMember(Assets) locked: Assets;

	constructor(nonce: bigint, values: Assets, locked: Assets) {
		this.nonce = new BigInteger(nonce);
		this.values = values;
		this.locked = locked;
	}
}
