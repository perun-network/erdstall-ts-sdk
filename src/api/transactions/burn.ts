// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { Address } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ABIEncoder } from "#erdstall/api/util";

const burnTypeName = "Burn";

@jsonObject
export class Burn extends Transaction {
	@jsonMember(() => Assets) values: Assets;

	constructor(sender: Address, nonce: bigint, values: Assets) {
		super(sender, nonce);
		this.values = values;
	}

	public txType() {
		return Burn;
	}
	protected txTypeName(): string {
		return burnTypeName;
	}
	protected encodeABI(e: ABIEncoder, _: Address): string {
		e.encode(this.values);
		return "ErdstallBurn";
	}
}

registerTransactionType(burnTypeName, Burn);
