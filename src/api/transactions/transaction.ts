// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address, Signature } from "#erdstall/ledger";
import { customJSON, ABIEncoder, ABIPacked } from "#erdstall/api/util";
import {
	jsonObject,
	jsonMember,
	TypedJSON,
	Serializable,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";
import { utils } from "ethers";
import { Backend, Signer } from "#erdstall/ledger/backend";
import canonicalize from "canonicalize";

const transactionImpls = new Map<string, Serializable<Transaction>>();
const transactionTypeName = "Transaction";

export function registerTransactionType(
	typeName: string,
	typeClass: Serializable<Transaction>,
) {
	transactionImpls.set(typeName, typeClass);
}

/** Transaction is the base class for all transactions. */
@jsonObject
export abstract class Transaction extends ErdstallObject {
	@jsonMember(Address) sender: Address<Backend>;
	@jsonBigIntMember() nonce: bigint;
	@jsonMember(Signature) sig?: Signature<Backend>;

	constructor(sender: Address<Backend>, nonce: bigint) {
		super();
		this.sender = sender;
		this.nonce = nonce;
	}

	async sign(signer: Signer<Backend>): Promise<this> {
		const msg = canonicalize(Transaction.toJSON(this));
		if (msg === undefined) {
			throw new Error("failed to canonicalize transaction");
		} else {
			this.sig = await signer.signMessage(utils.arrayify(msg));
		}
		return this;
	}

	verify(): boolean {
		if (!this.sig) {
			return false;
		}
		const rec = utils.verifyMessage(
			this.packTagged().keccak256(),
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
	}

	packTagged(): ABIPacked {
		// TODO: This should use the canonicalized JSON representation of the
		// transaction.
		throw new Error("not implemented");
	}

	hash(): string {
		const toHash = this.packTagged();
		throw new Error("not implemented");
		// return utils.keccak256(
		// 	new Uint8Array([...toHash.bytes, ...this.sig!.value]),
		// );
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
	protected abstract encodeABI(_: ABIEncoder): string;
}

registerErdstallType(transactionTypeName, Transaction);
customJSON(Transaction);

TypedJSON.mapType(Uint8Array, {
	deserializer: (json: string) => {
		if (!json) {
			return new Uint8Array();
		}
		return utils.arrayify(json, { allowMissingPrefix: true });
	},
	serializer: (value) => (value == null ? value : utils.hexlify(value)),
});
@jsonObject
export class TransactionOutput {
	@jsonMember(Uint8Array) payload: Uint8Array;

	constructor(payload: Uint8Array) {
		this.payload = payload;
	}
}
