// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { Address } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ABIEncoder } from "#erdstall/api/util";

const transferTypeName = "Transfer";

@jsonObject
export class Transfer extends Transaction {
	@jsonMember(Address) recipient: Address;
	@jsonMember(() => Assets) values: Assets;

	constructor(
		sender: Address,
		nonce: bigint,
		recipient: Address,
		values: Assets,
	) {
		super(sender, nonce);
		this.recipient = recipient;
		this.values = values;
	}

	public txType() {
		return Transfer;
	}
	protected txTypeName(): string {
		return transferTypeName;
	}
	protected encodeABI(e: ABIEncoder, _: Address): string {
		e.encode(this.recipient, this.values);
		return "ErdstallTransaction";
	}
}

registerTransactionType(transferTypeName, Transfer);
