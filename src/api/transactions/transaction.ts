// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "../object";
import { Signature } from "../signature";
import { Address } from "../../ledger";
import { BigInteger, CustomJSON, ABIEncoder, ABIPacked } from "../util";
import { jsonObject, jsonMember, TypedJSON } from "typedjson";
import { utils, Signer } from "ethers";

/** Transaction is the base class for all transactions. */
@jsonObject
export abstract class Transaction extends ErdstallObject {
	@jsonMember(Address) sender: Address;
	@jsonMember(BigInteger) nonce: BigInteger;
	@jsonMember(Signature) sig?: Signature;

	constructor(sender: Address, nonce: bigint) {
		super();
		this.sender = sender;
		this.nonce = new BigInteger(nonce);
	}

	async sign(contract: Address, signer: Signer): Promise<this> {
		const sig = await signer.signMessage(this.asABITagged(contract).keccak256());
		this.sig = new Signature(utils.arrayify(sig));
		return this;
	}

	verify(contract: Address): boolean {
		if (!this.sig) {
			return false;
		}
		const rec = utils.verifyMessage(
			this.asABITagged(contract).keccak256(),
			this.sig!.toString(),
		);

		return rec === this.sender.toString();
	}

	asABITagged(contract: Address): ABIPacked {
		const enc = new ABIEncoder(this.sender, ["uint64", this.nonce]);
		return enc.pack(this.encodeABI(enc, contract), contract);
	}

	static toJSON(me: Transaction) {
		return {
			type: me.txTypeName(),
			data: JSON.parse(TypedJSON.stringify(me, me.txType())),
		};
	}
	static fromJSON: (json: any) => Transaction;

	public objectType(): any {
		return Transaction;
	}
	protected objectTypeName(): string {
		return "Transaction";
	}

	public abstract txType(): any;
	protected abstract txTypeName(): string;
	protected abstract encodeABI(_: ABIEncoder, contract: Address): string;
}

CustomJSON(Transaction);
