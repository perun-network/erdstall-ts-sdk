// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Address, Signature, Signer, Crypto } from "#erdstall/crypto";
import { customJSON, ABIPacked } from "#erdstall/api/util";
import {
	jsonObject,
	jsonMember,
	TypedJSON,
	Serializable,
	jsonU64Member,
} from "#erdstall/export/typedjson";
import canonicalize from "canonicalize";
import { ethers } from "ethers";
import { toHex, parseHex } from "#erdstall/utils/hexbytes";

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
	@jsonMember(() => Address) sender: Address<Crypto>;
	@jsonU64Member() nonce: bigint;
	@jsonMember(() => Signature) sig?: Signature<Crypto>;

	constructor(sender: Address<Crypto>, nonce: bigint) {
		super();
		this.sender = sender;
		this.nonce = nonce;
	}

	async sign(signer: Signer<Crypto>): Promise<this> {
		this.sender = await signer.address();
		const msg = this.encodePayload();
		this.sig = await signer.sign(msg);
		return this;
	}

	verify(): boolean {
		if (!this.sig) {
			return false;
		}

		return this.sig.verify(
			this.encodePayload(),
			this.sender
		);
	}

	static fromJSON(js: any): Transaction {
		let data = JSON.stringify(js.data);

		if (!transactionImpls.has(js.type)) {
			throw new Error(`unknown transaction type "${js.type}"`);
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return TypedJSON.parse(data, transactionImpls.get(js.type)!)!;
	}

	encodePayload(): Uint8Array {
		let clone = Object.assign(
			Object.create(Object.getPrototypeOf(this)),
			{...this, sig: undefined});
		const msg = canonicalize(
			{ value: Transaction.toJSON(clone)},
		);
		if (msg === undefined) {
			throw new Error("failed to canonicalize transaction");
		}
		const enc = new TextEncoder();
		return enc.encode(msg);
	}

	hash(): string {
		const toHash = this.encodePayload();
		return ethers.keccak256(
			new Uint8Array([...toHash, ...this.sig!.toBytes()]),
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
	override objectTypeName(): string {
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
		return parseHex(json, "0x");
	},
	serializer: (value) => (value == null ? value : toHex(value, "0x")),
});
@jsonObject
export class TransactionOutput {
	@jsonMember(Uint8Array) payload: Uint8Array;

	constructor(payload: Uint8Array) {
		this.payload = payload;
	}
}
