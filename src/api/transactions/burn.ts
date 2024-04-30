// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { Address, Crypto } from "#erdstall/crypto";
import { ChainAssets } from "#erdstall/ledger/assets";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";

const burnTypeName = "Burn";

@jsonObject
export class Burn extends Transaction {
	@jsonMember(() => ChainAssets) values: ChainAssets;

	constructor(sender: Address<Crypto>, nonce: bigint, values: ChainAssets) {
		super(sender, nonce);
		this.values = values;
	}

	public txType() {
		return Burn;
	}
	protected txTypeName(): string {
		return burnTypeName;
	}
}

registerTransactionType(burnTypeName, Burn);
