// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "../object";
import { Signature } from "../signature";
import { Address } from "../../ledger";
import { BigInteger, CustomJSON, ABIEncoder } from "../util";
import { jsonObject, jsonMember, TypedJSON } from "typedjson";
import { utils, Signer } from "ethers";

/** Transaction is the base class for all transactions. */
@jsonObject export abstract class Transaction extends ErdstallObject {
	@jsonMember(Address) sender: Address;
	@jsonMember(BigInteger) nonce: BigInteger;
	@jsonMember(BigInteger) epoch: BigInteger;
	@jsonMember(Signature) sig?: Signature;

	constructor(sender: Address, nonce: bigint, epoch: bigint) {
		super();
		this.sender = sender;
		this.nonce = new BigInteger(nonce);
		this.epoch = new BigInteger(epoch);
	}

	async sign(contract: Address, signer: Signer): Promise<this> {
		const encoder = new ABIEncoder().encode(
			this.sender, ["uint64", this.nonce], ["uint64", this.epoch]
		);
		const tag = this.encodeABI(encoder);
		const msg = encoder.pack(tag, contract);
		const data = utils.keccak256(msg);
		const sig = await signer.signMessage(utils.arrayify(data));
		this.sig = new Signature(utils.arrayify(sig));
		return this;
	}

	static toJSON(me: Transaction) {
		return {
			type: me.txTypeName(),
			data: JSON.parse(TypedJSON.stringify(me, me.txType())),
		};
	}
	static fromJSON: (json: any) => Transaction;

	protected objectType(): any { return Transaction; }
	protected objectTypeName(): string { return "Transaction"; }

	protected abstract txType(): any;
	protected abstract txTypeName(): string;
	protected abstract encodeABI(_: ABIEncoder): string;
}

CustomJSON(Transaction);
