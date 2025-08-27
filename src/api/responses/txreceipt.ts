// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Account } from "#erdstall/ledger";
import {
	Address,
	Signature,
	SignedMessage,
	SigVerifier,
} from "#erdstall/crypto";
import { Transaction, TransactionOutput } from "#erdstall/api/transactions";
import { jsonObject } from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";
import { CodecReader, CodecWriter } from "#erdstall/utils";

const directTxReceiptTypeName = "DirectTxReceipt";
const publicTxReceiptTypeName = "PublicTxReceipt";

export enum TxStatusCode {
	Fail = 0,
	Success = 1,
}

export class SignedPublicTxReceipt extends ErdstallObject {
	constructor(
		// who the receipt is for, if encrypted, or none if public.
		public target: Address | undefined,
		// The actual receipt.
		public sig: SignedMessage<PublicTxReceipt>,
	) {
		super();
	}

	override objectType() {
		return SignedPublicTxReceipt;
	}
	override objectTypeName() {
		return publicTxReceiptTypeName;
	}

	async verify(v: SigVerifier): Promise<PublicTxReceipt | undefined> {
		let decoded = await v.verifySig(this.sig);
		if (!decoded) return undefined;

		return PublicTxReceipt.decode(new CodecReader(decoded));
	}

	override encode(w: CodecWriter): void {
		w.opt_with(this.target, (v) => Address.encode(w, v));
		this.sig.encode(w);
	}
	static decode(r: CodecReader): SignedPublicTxReceipt {
		return new SignedPublicTxReceipt(
			r.opt(Address.decode),
			SignedMessage.decode(r),
		);
	}
}
registerErdstallType(publicTxReceiptTypeName, SignedPublicTxReceipt);

export class SignedDirectTxReceipt extends ErdstallObject {
	constructor(public sig: SignedMessage<DirectTxReceipt>) {
		super();
	}

	override objectType() {
		return SignedDirectTxReceipt;
	}
	override objectTypeName() {
		return directTxReceiptTypeName;
	}

	async verify(v: SigVerifier): Promise<DirectTxReceipt | undefined> {
		let decoded = await v.verifySig(this.sig);
		if (!decoded) return undefined;

		return DirectTxReceipt.decode(new CodecReader(decoded));
	}

	override encode(w: CodecWriter): void {
		this.sig.encode(w);
	}
	static decode(r: CodecReader): SignedDirectTxReceipt {
		return new SignedDirectTxReceipt(SignedMessage.decode(r));
	}
}

registerErdstallType(directTxReceiptTypeName, SignedDirectTxReceipt);

export class PublicTxReceipt {
	constructor(
		// Only successful transactions become public, therefore no status field. This transaction is decoded using the "Stripped" version and some fields have dummy values.
		public transaction: Transaction,
		public output: TransactionOutput, // do we even need this in a public receipt?
	) {}

	encode(w: CodecWriter): void {
		this.transaction.encodeStripped(w);
		TransactionOutput.encode(w, this.output);
	}

	static decode(r: CodecReader): PublicTxReceipt {
		return new PublicTxReceipt(
			Transaction.decodeStripped(r),
			TransactionOutput.decode(r),
		);
	}
}

export class DirectTxReceipt {
	constructor(
		public output: TransactionOutput,
		public status: number,
		public error?: string,
	) {}

	encode(w: CodecWriter): void {
		w.u16(this.output.payload.length);
		w.bytes(this.output.payload);

		w.u8(this.status);

		let err = new TextEncoder().encode(this.error ?? "");
		w.u16(err.length);
		w.bytes(err);
	}
	static decode(r: CodecReader): DirectTxReceipt {
		let output = new TransactionOutput(r.bytes(r.u16()));
		let status = r.u8();
		let error = new TextDecoder().decode(r.bytes(r.u16()));

		return new DirectTxReceipt(
			output,
			status,
			error.length ? error : undefined,
		);
	}

	// helper: maps failed transactions into thrown exceptions, otherwise returns the TX output.
	ok(): TransactionOutput {
		if (this.status !== TxStatusCode.Success)
			throw new Error(this.error ?? "Transaction failed");
		return this.output;
	}
}
