// SPDX-License-Identifier: Apache-2.0
"use strict";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Signature } from "#erdstall/api";
import { Address } from "#erdstall/ledger";
import { customJSON, ABIEncoder, ABIPacked } from "#erdstall/api/util";
import {
	jsonObject,
	jsonMember,
	TypedJSON,
	Serializable,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";
import { utils, Signer } from "ethers";
import { ETHZERO } from "#erdstall/ledger/assets";
import { canonicalize } from "json-canonicalize";

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
	@jsonMember(Address) sender: Address;
	@jsonBigIntMember() nonce: bigint;
	@jsonMember(Signature) sig?: Signature;

	constructor(sender: Address, nonce: bigint) {
		super();
		this.sender = sender;
		this.nonce = nonce;
	}

	async sign(contract: Address, signer: Signer): Promise<this> {
		const sig = await signer.signMessage(
			this.packTagged(contract).keccak256(),
		);
		this.sig = new Signature(sig);
		return this;
	}

	verify(contract: Address): boolean {
		if (!this.sig) {
			return false;
		}
		const rec = utils.verifyMessage(
			this.packTagged(contract).keccak256(),
			this.sig!.toString(),
		);

		return rec === this.sender.toString();
	}

	packTagged(contract: Address): ABIPacked {
		const txJson = Transaction.toJSON(this);
		delete(txJson.data.sig);
		return new ABIPacked(
			utils.toUtf8Bytes(canonicalize({contract: Address.toJSON(contract), value: txJson})));
	}

	static fromJSON(js: any): Transaction {
		let data = JSON.stringify(js.data);

		if (!transactionImpls.has(js.type)) {
			throw new Error(`unknown transaction type "${js.type}"`);
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return TypedJSON.parse(data, transactionImpls.get(js.type)!)!;
	}

	hash(): string {
		const toHash = this.packTagged(Address.fromString(ETHZERO));
		return utils.keccak256(
			new Uint8Array([...toHash.bytes, ...this.sig!.value]),
		);
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
}

registerErdstallType(transactionTypeName, Transaction);
customJSON(Transaction);

TypedJSON.mapType(Uint8Array, {
	deserializer: (json: string) => {
		if (!json) {
			return new Uint8Array();
		}
		return utils.arrayify(json);
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
