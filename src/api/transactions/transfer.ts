// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { assets, Address } from "#erdstall/ledger";
import { jsonObject, jsonMember } from "typedjson";
import { ABIEncoder, ABIValue } from "#erdstall/api/util";

const transferTypeName = "Transfer";

@jsonObject
export class Transfer extends Transaction {
	@jsonMember(Address) recipient: Address;
	@jsonMember(assets.Assets) values: assets.Assets;

	constructor(
		sender: Address,
		nonce: bigint,
		recipient: Address,
		values: assets.Assets,
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
	protected encodeABI(e: ABIEncoder): string {
		e.encode(this.recipient, this.values as ABIValue);
		return "ErdstallTransaction";
	}
}

registerTransactionType(transferTypeName, Transfer);
