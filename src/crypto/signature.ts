// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Serializable, TypedJSON } from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";
import { Crypto, Address } from "#erdstall/crypto";
import { CodecReader, CodecWriter } from "#erdstall/utils";

const signatureImpls = new Map<string, Serializable<Signature<Crypto>>>();

export function registerSignatureType(
	typeName: string,
	typeClass: Serializable<Signature<Crypto>>,
) {
	signatureImpls.set(typeName, typeClass);
}

export const _signatureDecoders = new Map<
	SignatureType,
	(r: CodecReader) => Signature
>();

export enum SignatureType {
	Ethereum,
	Substrate,
	Wildcard,
}

export abstract class Signature<B extends Crypto = Crypto> {
	abstract toString(): string;

	abstract toJSON(): any;

	abstract toBytes(): Uint8Array;

	abstract type(): B;

	abstract clone(): this;

	abstract signatureType(): SignatureType;
	abstract encode_impl(w: CodecWriter): void;
	encode(w: CodecWriter): void {
		Signature.encode(w, this);
	}
	static encode(w: CodecWriter, v: Signature): void {
		w.u8(v.signatureType());
		v.encode_impl(w);
	}
	static decode(r: CodecReader): Signature {
		let t = r.u8() as SignatureType;
		let dec = _signatureDecoders.get(t);
		if (dec) return dec(r);
		else throw new Error(`Unknown signature type ${t}`);
	}

	static toJSON(me: Signature) {
		return {
			type: me.type(),
			data: me.toJSON(),
		};
	}

	static fromJSON(js: any): Signature {
		let data = JSON.stringify(js.data);
		if (!signatureImpls.has(js.type)) {
			throw new Error(`unknown signature type ${js.type}`);
		}

		return TypedJSON.parse(data, signatureImpls.get(js.type)!)!;
	}
}

customJSON(Signature);

export interface SigVerifier {
	// returns undefined if the signature is invalid. Otherwise, returns the message that was signed.
	verifySig(s: SignedMessage): Promise<Uint8Array | undefined>;
}

// Either signed or encrypted with integrity protection, depending on the implementation.
export class SignedMessage<T = any> {
	constructor(
		public message: Uint8Array, // the potentially encrypted message
		public signature: Signature | undefined, // the signature on the message (the IV for AES-GCM)
	) {}

	encode(w: CodecWriter): void {
		w.opt_with(this.signature, (s) => Signature.encode(w, s));
		w.u16(this.message.length);
		w.bytes(this.message);
	}

	static decode<T = any>(r: CodecReader): SignedMessage<T> {
		let sig = r.opt(Signature.decode);
		return new SignedMessage(r.bytes(r.u16()), sig);
	}

	assert_signed(): void {
		if (!this.signature) throw new Error("Message was expected to be signed");
	}

	static unsigned<T = any>(message: Uint8Array): SignedMessage<T> {
		return new SignedMessage<T>(message, undefined);
	}
}
