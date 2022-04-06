// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Account, Address } from "#erdstall/ledger";
import { Transaction, TransactionOutput } from "#erdstall/api/transactions";
import {
	jsonObject,
	jsonMember,
	jsonMapMember,
	MapShape,
} from "#erdstall/export/typedjson";
import { Signature } from "../signature";
import { utils } from "ethers";
import { ABIEncoder, ABIPacked } from "../util";
import { ETHZERO } from "#erdstall/ledger/assets";

const txReceiptTypeName = "TxReceipt";

export enum TxStatusCode {
	Fail = 0,
	Success = 1,
}

@jsonObject
export class TxReceipt extends ErdstallObject {
	@jsonMember(() => Transaction) tx: Transaction;
	@jsonMember(TransactionOutput) output: TransactionOutput;
	@jsonMember(() => Signature) sig: Signature;
	@jsonMember(String) hash: String;

	@jsonMapMember(String, () => Account, { shape: MapShape.OBJECT })
	delta: Map<string, Account>;
	/**
	 * Erdstall standard status codes can be checked against the enum TxStatusCode
	 */
	@jsonMember(Number) status: Number;
	@jsonMember(String) error?: string;

	constructor(
		tx: Transaction,
		delta: Map<string, Account>,
		status: Number,
		output: TransactionOutput,
		sig: Signature,
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
	protected objectTypeName(): string {
		return txReceiptTypeName;
	}
	packTagged(_: Address): ABIPacked {
		const enc = new ABIEncoder();
		return enc.pack(this.encodeABI(enc, _), Address.fromString(ETHZERO));
	}
	protected encodeABI(e: ABIEncoder, _: Address): string {
		e.encode(
			["bytes", utils.arrayify(this.hash as utils.BytesLike)],
			["bytes", this.output.payload],
		);
		return "ErdstallTransactionOutput";
	}
	verify(contract: Address): boolean {
		console.log(
			utils.hexlify(this.packTagged(Address.fromString(ETHZERO)).bytes),
		);
		if (!this.sig) {
			return false;
		}
		const rec = utils.verifyMessage(
			this.packTagged(contract).keccak256(),
			this.sig!.toString(),
		);
		console.log(rec);
		console.log(this.tx.sender.toString());
		return rec === this.tx.sender.toString();
	}
}

registerErdstallType(txReceiptTypeName, TxReceipt);
