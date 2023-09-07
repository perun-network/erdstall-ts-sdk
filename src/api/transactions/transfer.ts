// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { Address } from "#erdstall/ledger";
import { ChainAssets } from "#erdstall/ledger/assets";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { ABIEncoder } from "#erdstall/api/util";
import { Backend } from "#erdstall/ledger/backend";

const transferTypeName = "Transfer";

@jsonObject
export class Transfer extends Transaction {
	@jsonMember(Address) recipient: Address<Backend>;
	@jsonMember(() => ChainAssets) values: ChainAssets;

	constructor(
		sender: Address<Backend>,
		nonce: bigint,
		recipient: Address<Backend>,
		values: ChainAssets,
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
		// TODO: Implement
		throw new Error("Method not implemented.");
		// e.encode(this.recipient, this.values);
		// return "ErdstallTransaction";
	}
}

registerTransactionType(transferTypeName, Transfer);
