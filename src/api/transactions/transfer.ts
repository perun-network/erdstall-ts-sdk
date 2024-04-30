// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { ChainAssets } from "#erdstall/ledger/assets";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { Address, Crypto } from "#erdstall/crypto";

const transferTypeName = "Transfer";

@jsonObject
export class Transfer extends Transaction {
	@jsonMember(Address) recipient: Address<Crypto>;
	@jsonMember(() => ChainAssets) values: ChainAssets;

	constructor(
		sender: Address<Crypto>,
		nonce: bigint,
		recipient: Address<Crypto>,
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
}

registerTransactionType(transferTypeName, Transfer);
