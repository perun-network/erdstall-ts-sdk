// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Account } from "#erdstall/ledger";
import { Address, Signature, Crypto } from "#erdstall/crypto";
import { Transaction, TransactionOutput } from "#erdstall/api/transactions";
import {
	jsonObject,
	jsonMember,
	jsonMapMember,
	TypedJSON,
	MapShape,
} from "#erdstall/export/typedjson";
import canonicalize from "canonicalize";

const txReceiptTypeName = "TxReceipt";

export enum TxStatusCode {
	Fail = 0,
	Success = 1,
}

@jsonObject
export class TxReceipt extends ErdstallObject {
	@jsonMember(() => Transaction) tx: Transaction;
	@jsonMember(() => TransactionOutput) output: TransactionOutput;
	@jsonMember(() => Signature) sig: Signature;
	@jsonMember(String) hash: string;

	@jsonMapMember(String, () => Account, { shape: MapShape.OBJECT })
	delta: Map<string, Account>;
	/**
	 * Erdstall standard status codes can be checked against the enum TxStatusCode
	 */
	@jsonMember(Number) status: number;
	@jsonMember(String) error?: string;

	constructor(
		tx: Transaction,
		delta: Map<string, Account>,
		status: number,
		output: TransactionOutput,
		sig: Signature<Crypto>,
		hash: string,
		error?: string,
	) {
		super();
		this.tx = tx;
		this.delta = delta;
		this.status = status;
		this.output = output;
		this.sig = sig;
		this.hash = hash;
		this.error = error;
	}

	public objectType(): any {
		return TxReceipt;
	}
	override objectTypeName(): string {
		return txReceiptTypeName;
	}
	protected encodePayload(): Uint8Array {
		const json = JSON.parse(TypedJSON.stringify(this, TxReceipt));
		delete json.sig;
		const msg = canonicalize(
			JSON.stringify({value: json }),
		);
		return new TextEncoder().encode(msg);
	}
	verify(enclaveNativeSigner: Address<Crypto>): boolean {
		if (!this.sig) {
			return false;
		}
		return this.sig!.verify(
			this.encodePayload(),
			enclaveNativeSigner);
	}
}

registerErdstallType(txReceiptTypeName, TxReceipt);
