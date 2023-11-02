// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonObject,
	jsonMember,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";
import { ChainAssets } from "#erdstall/ledger/assets";

/**
 * Account is the state of a user within Erdstall, including the last nonce and
 * free locked assets. It is returned by an `EnclaveReader.getAccount` query.
 */
@jsonObject
export class Account {
	@jsonBigIntMember() nonce: bigint;
	@jsonMember(() => ChainAssets) values: ChainAssets;
	@jsonMember(() => ChainAssets) locked: ChainAssets;

	constructor(nonce: bigint, values: ChainAssets, locked?: ChainAssets) {
		this.nonce = nonce;
		this.values = values;
		if (locked === undefined) {
			locked = new ChainAssets(new Map());
		}
		this.locked = locked;
	}
}
