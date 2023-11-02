// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { Address, Crypto } from "#erdstall/crypto";
import {
	jsonObject,
	jsonMember,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";

const mintTypeName = "Mint";

@jsonObject
export class Mint extends Transaction {
	@jsonMember(Uint8Array) token: Uint8Array;
	@jsonBigIntMember() id: bigint;

	constructor(
		sender: Address<Crypto>,
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
}

registerTransactionType(mintTypeName, Mint);
