// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { Address } from "#erdstall/ledger";
import { ChainAssets } from "#erdstall/ledger/assets";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ABIEncoder } from "#erdstall/api/util";
import { Backend } from "#erdstall/ledger/backend";

const burnTypeName = "Burn";

@jsonObject
export class Burn extends Transaction {
	@jsonMember(() => ChainAssets) values: ChainAssets;

	constructor(sender: Address<Backend>, nonce: bigint, values: ChainAssets) {
		super(sender, nonce);
		this.values = values;
	}

	public txType() {
		return Burn;
	}
	protected txTypeName(): string {
		return burnTypeName;
	}
	protected encodeABI(e: ABIEncoder): string {
		e.encode(this.values);
		return "ErdstallBurn";
	}
}

registerTransactionType(burnTypeName, Burn);
