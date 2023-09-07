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
import { Backend } from "#erdstall/ledger/backend";

const mintTypeName = "Mint";

@jsonObject
export class Mint extends Transaction {
	@jsonMember(Uint8Array) token: Uint8Array;
	@jsonBigIntMember() id: bigint;

	constructor(
		sender: Address<Backend>,
		nonce: bigint,
		tokenType: Uint8Array,
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
	protected encodeABI(e: ABIEncoder): string {
		e.encode(this.token, ["uint256", this.id]);
		return "ErdstallMint";
	}
}

registerTransactionType(mintTypeName, Mint);
