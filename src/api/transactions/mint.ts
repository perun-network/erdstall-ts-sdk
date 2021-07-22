// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction } from "./transaction";
import { Address } from "#erdstall/ledger";
import { jsonObject, jsonMember } from "typedjson";
import { ABIEncoder, BigInteger } from "#erdstall/api/util";

@jsonObject
export class Mint extends Transaction {
	@jsonMember(Address) token: Address;
	@jsonMember(BigInteger) id: BigInteger;

	constructor(
		sender: Address,
		nonce: bigint,
		tokenType: Address,
		id: bigint,
	) {
		super(sender, nonce);
		this.token = tokenType;
		this.id = new BigInteger(id);
	}

	public txType() {
		return Mint;
	}
	protected txTypeName(): string {
		return "Mint";
	}
	protected encodeABI(e: ABIEncoder): string {
		e.encode(this.token, ["uint256", this.id]);
		return "ErdstallMintTX";
	}
}
