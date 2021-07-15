// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction } from "./transaction";
import { assets, Address } from "../../ledger";
import { jsonObject, jsonMember } from "typedjson";
import { ABIEncoder, ABIValue } from "../util";

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
		return "Transfer";
	}
	protected encodeABI(e: ABIEncoder): string {
		e.encode(this.recipient, this.values as ABIValue);
		return "ErdstallTransaction";
	}
}
