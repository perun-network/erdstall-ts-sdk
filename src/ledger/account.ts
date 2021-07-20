// SPDX-License-Identifier: Apache-2.0
"use strict";

import * as assets from "#erdstall/ledger/assets";
import { jsonObject, jsonMember } from "typedjson";
import { BigInteger } from "#erdstall/api/util";

@jsonObject
export class Account {
	@jsonMember(BigInteger) nonce: BigInteger;
	@jsonMember(assets.Assets) values: assets.Assets;
	@jsonMember(assets.Assets) locked: assets.Assets;

	constructor(nonce: bigint, values: assets.Assets, locked: assets.Assets) {
		this.nonce = new BigInteger(nonce);
		this.values = values;
		this.locked = locked;
	}
}
