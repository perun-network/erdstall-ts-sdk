// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Signature } from "#erdstall/api";
import { Address } from "#erdstall/ledger";
import { BigInteger, CustomJSON, ABIEncoder, ABIPacked } from "#erdstall/api/util";
import { jsonObject, jsonMember, TypedJSON, Serializable } from "typedjson";
import { utils, Signer } from "ethers";

const transactionImpls = new Map<string, Serializable<Transaction>>();
const transactionTypeName = "Transaction";

export function registerTransactionType(typeName: string, typeClass: Serializable<Transaction>) {
	transactionImpls.set(typeName, typeClass);
}

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

	static fromJSON(js: any): Transaction {
		let data = JSON.stringify(js.data);

		if (!transactionImpls.has(js.type)) {
			throw new Error(`unknown transaction type "${js.type}"`);
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return TypedJSON.parse(data, transactionImpls.get(js.type)!)!;
	};

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

	public objectType() {
		return Transaction;
	}
	protected objectTypeName(): string {
		return transactionTypeName;
	}

	public abstract txType(): Serializable<Transaction>;
	protected abstract txTypeName(): string;
	protected abstract encodeABI(_: ABIEncoder, contract: Address): string;
}

registerErdstallType(transactionTypeName, Transaction);
CustomJSON(Transaction);
