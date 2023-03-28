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
import { ethers, Signer } from "ethers";
import { ETHZERO } from "#erdstall/ledger/assets";

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
		const rec = ethers.SigningKey.recoverPublicKey(
			this.packTagged(contract).keccak256(),
			this.sig!.toString());

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

	packTagged(contract: Address): ABIPacked {
		const enc = new ABIEncoder(this.sender, ["uint64", this.nonce]);
		return enc.pack(this.encodeABI(enc, contract), contract);
	}

	hash(): string {
		const toHash = this.packTagged(Address.fromString(ETHZERO));
		return ethers.keccak256(
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
	protected abstract encodeABI(_: ABIEncoder, contract: Address): string;
}

registerErdstallType(transactionTypeName, Transaction);
customJSON(Transaction);

TypedJSON.mapType(Uint8Array, {
	deserializer: (json: string) => {
		if (!json) {
			return new Uint8Array();
		}
		return ethers.getBytes(json);
	},
	serializer: (value) => (value == null ? value : ethers.hexlify(value)),
});
@jsonObject
export class TransactionOutput {
	@jsonMember(Uint8Array) payload: Uint8Array;

	constructor(payload: Uint8Array) {
		this.payload = payload;
	}
}
