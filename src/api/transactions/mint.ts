// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { Address } from "#erdstall/ledger";
import {
	jsonObject,
	jsonMember,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";
import { ABIEncoder } from "#erdstall/api/util";

const mintTypeName = "Mint";

@jsonObject
export class Mint extends Transaction {
	@jsonMember(Address) token: Address;
	@jsonBigIntMember() id: bigint;

	constructor(
		sender: Address,
		nonce: bigint,
		tokenType: Address,
		id: bigint,
	) {
		super(sender, nonce);
		this.token = tokenType;
		this.id = id;
	}

	public txType() {
		return Mint;
	}
	protected txTypeName(): string {
		return mintTypeName;
	}
	protected encodeABI(e: ABIEncoder, _: Address): string {
		e.encode(this.token, ["uint256", this.id]);
		return "ErdstallMint";
	}
}

registerTransactionType(mintTypeName, Mint);
