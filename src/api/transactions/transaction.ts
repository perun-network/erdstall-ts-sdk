// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import {
	Address,
	Signature,
	Signer,
	SignedMessage,
	SigVerifier,
} from "#erdstall/crypto";
import { customJSON } from "#erdstall/api/util";
import { jsonObject } from "#erdstall/export/typedjson";
import { ethers } from "ethers";
import { CodecReader, CodecWriter } from "#erdstall/utils";
import { parseHex } from "#erdstall/utils/hexbytes";

const transactionTypeName = "Transaction";
export const _transactionDecoders = new Map<
	TransactionType,
	(r: CodecReader, core: TxCore) => Transaction
>();

// Configurable nonce check type.
enum NonceCheckType {
	None,
	StrictIncrement,
	Permissive,
}
export abstract class NonceCheck {
	static decode(r: CodecReader): NonceCheck {
		let t = r.u8() as NonceCheckType;
		switch (t) {
			case NonceCheckType.None:
				return NoNonceCheck.decode_impl(r);
			case NonceCheckType.StrictIncrement:
				return StrictNonceCheck.decode_impl(r);
			case NonceCheckType.Permissive:
				return PermissiveNonceCheck.decode_impl(r);
			default:
				throw new Error(`Unknown nonce check type ${t}`);
		}
	}
	abstract encode_impl(w: CodecWriter): void;
	abstract nonceCheckType(): NonceCheckType;
	encode(w: CodecWriter): void {
		w.u8(this.nonceCheckType());
		this.encode_impl(w);
	}
}
export class NoNonceCheck extends NonceCheck {
	override encode_impl(w: CodecWriter): void {}
	override nonceCheckType(): NonceCheckType {
		return NonceCheckType.None;
	}
	static decode_impl(r: CodecReader): NoNonceCheck {
		return new NoNonceCheck();
	}
}
export class StrictNonceCheck extends NonceCheck {
	constructor(public nonce: bigint) {
		super();
	}
	override encode_impl(w: CodecWriter): void {
		w.u64(this.nonce);
	}
	override nonceCheckType(): NonceCheckType {
		return NonceCheckType.StrictIncrement;
	}
	static decode_impl(r: CodecReader): StrictNonceCheck {
		return new StrictNonceCheck(r.u64());
	}
}
export class PermissiveNonceCheck extends NonceCheck {
	constructor(public nonce: bigint) {
		super();
	}
	override encode_impl(w: CodecWriter): void {
		w.u64(this.nonce);
	}
	override nonceCheckType(): NonceCheckType {
		return NonceCheckType.Permissive;
	}
	static decode_impl(r: CodecReader): PermissiveNonceCheck {
		return new PermissiveNonceCheck(r.u64());
	}
}

// Transaction encoding enum.
export enum TransactionType {
	Transfer,
	Mint,
	Burn,
	FullExit,
	PartialExit,
	RegisterWatcher,
	LinkAccount,
	GetAccount,
	SetPrivacy,
}

@jsonObject
// Signed transaction as sent over the network. Since "signing" can also mean authenticated encryption, only verifying the signature yields the actual data.
export class SignedTransaction<
	Tx extends Transaction = Transaction,
> extends ErdstallObject {
	constructor(
		public sender: Address,
		public sig: SignedMessage,
	) {
		super();
	}

	static toJSON(self: SignedTransaction): string {
		let w = new CodecWriter();
		self.encode(w);
		return w.getAsString();
	}

	static fromJSON(json: string): SignedTransaction {
		return SignedTransaction.decode(CodecReader.fromString(json));
	}

	override objectType() {
		return SignedTransaction;
	}
	override objectTypeName(): string {
		return transactionTypeName;
	}

	async verify(v: SigVerifier): Promise<Tx | undefined> {
		let verified = await v.verifySig(this.sig);
		if (!verified) return undefined;

		let r = new CodecReader(verified);
		return Transaction.decode_payload(this.sender, r) as Tx;
	}

	override encode(w: CodecWriter): void {
		this.sender.encode(w);
		this.sig.encode(w);
	}

	static decode(r: CodecReader): SignedTransaction {
		let sender = Address.decode(r);
		let sig = SignedMessage.decode(r);
		return new SignedTransaction(sender, sig);
	}
}

registerErdstallType(transactionTypeName, SignedTransaction);
customJSON(SignedTransaction);

export class TxCore {
	constructor(
		public sender: Address,
		public nonce: NonceCheck,
		public forceReplyPlainText: boolean,
	) {}
}

/** Transactions to be sent, not the same as transactions that are part of receipts, as they do not need to contain the nonce. */
export abstract class Transaction extends TxCore {
	constructor(core: TxCore) {
		super(core.sender, core.nonce, core.forceReplyPlainText);
	}

	// Does not have a plain encode() because it is never sent, and the signature encoding does not contain the sender.
	encodePayload(w: CodecWriter): void {
		w.u8(this.transactionType());
		this.nonce.encode(w);
		w.bool(this.forceReplyPlainText);
		this.encode_impl(w);
	}

	// Stripped: for inclusion in TX receipts, does not contain the nonce or signature etc.
	encodeStripped(w: CodecWriter): void {
		Address.encode(w, this.sender);
		w.u8(this.transactionType());
		this.encode_impl(w);
	}
	static decodeStripped(r: CodecReader): Transaction {
		let sender = Address.decode(r);
		let t = r.u8() as TransactionType;
		let dec = _transactionDecoders.get(t);
		if (!dec) throw new Error(`Unknown transaction type ${t}`);
		return dec(r, new TxCore(sender, new NoNonceCheck(), false));
	}

	protected abstract transactionType(): TransactionType;
	protected abstract encode_impl(w: CodecWriter): void;
	static decode_payload(sender: Address, r: CodecReader): Transaction {
		let t = r.u8() as TransactionType;
		let dec = _transactionDecoders.get(t);
		if (!dec) throw new Error(`Unknown transaction type ${t}`);

		let nonce = NonceCheck.decode(r);
		let forceReplyPlainText = r.bool();
		return dec(r, new TxCore(sender, nonce, forceReplyPlainText));
	}

	unsigned(): SignedTransaction<this> {
		let tx_enc = new CodecWriter();
		this.encodePayload(tx_enc);

		return new SignedTransaction<this>(
			this.sender,
			SignedMessage.unsigned(tx_enc.get()),
		);
	}
}

export class TransactionOutput {
	constructor(public payload: Uint8Array) {}

	encode(w: CodecWriter): void {
		TransactionOutput.encode(w, this);
	}
	static encode(w: CodecWriter, self: TransactionOutput) {
		w.u16(self.payload.length);
		w.bytes(self.payload);
	}
	static decode(r: CodecReader): TransactionOutput {
		return new TransactionOutput(r.bytes(r.u16()));
	}

	reader(): CodecReader {
		return new CodecReader(this.payload);
	}
}
