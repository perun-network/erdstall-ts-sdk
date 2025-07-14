// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Signature,
	SignatureType,
	_signatureDecoders,
	SigVerifier,
	SignedMessage
} from "#erdstall/crypto";
import { CodecReader, CodecWriter } from "#erdstall/utils";
import { toHex } from "#erdstall/utils/hexbytes";

// Declare the web SubtleCrypto interface for typescript.
interface DHKeyGen { name: "X25519"; }
interface AESGCMKeyGen { name: "AES-GCM"; }
interface AESGCMKeyParams { name: "AES-GCM"; length: 256; }
interface DHDeriveParams { name: "X25519"; public: DHPubKey; }

declare class DHPrivKey {}
declare class DHPubKey  {}
declare class DHKeyPair {
	privateKey: DHPrivKey;
	publicKey: DHPubKey;
}

interface AesGcmParams {
	name: "AES-GCM";
	iv: ArrayBuffer | Uint8Array | DataView;
	additionalData?: ArrayBuffer | Uint8Array | DataView;
	tagLength: 32 | 64 | 96 | 104 | 112 | 120 | 128;
}

declare class AesGcmKey {}

declare namespace globalThis.crypto {
	function getRandomValues(v: Uint8Array): Uint8Array;
}
export const getRandomValues = globalThis.crypto.getRandomValues;

declare namespace globalThis.crypto.subtle {
	function generateKey(
		algo: DHKeyGen,
		extractable: true,
		keyUsages: ["deriveKey"]): Promise<DHKeyPair>;

	function exportKey(
		format: "raw",
		key: DHPubKey): Promise<ArrayBuffer>;

	function exportKey(
		format: "raw",
		key: AesGcmKey): Promise<ArrayBuffer>;

	function importKey(
		format: "raw",
		keyData: ArrayBuffer | Uint8Array | DataView,
		algorithm: DHKeyGen,
		extractable: true,
		keyUsages: []): Promise<DHPubKey>;

	function importKey(
		format: "raw",
		keyData: ArrayBuffer | Uint8Array | DataView,
		algorithm: AESGCMKeyGen,
		extractable: true,
		keyUsages: ["encrypt", "decrypt"]): Promise<AesGcmKey>;

	function deriveKey(
		algorithm: DHDeriveParams,
		baseKey: DHPrivKey,
		derivedKeyAlgorithm: AESGCMKeyParams,
		extractable: boolean,
		keyUsages: ["encrypt", "decrypt"]): Promise<AESGCMKey>;

	function encrypt(
		algorithm: AesGcmParams,
		key: AesGcmKey,
		data: ArrayBuffer | Uint8Array | DataView):  Promise<ArrayBuffer>;

	function decrypt(
		algorithm: AesGcmParams,
		key: AesGcmKey,
		data: ArrayBuffer | Uint8Array | DataView): Promise<ArrayBuffer>;
}

const generateKey = globalThis.crypto.subtle.generateKey;
const exportKey = globalThis.crypto.subtle.exportKey;
const importKey = globalThis.crypto.subtle.importKey;
const deriveKey = globalThis.crypto.subtle.deriveKey;
const encrypt = globalThis.crypto.subtle.encrypt;
const decrypt = globalThis.crypto.subtle.decrypt;

export class DHPK {
	#key?: DHPubKey;
	#bytes: Uint8Array & { length: 32 };

	constructor(bytes: Uint8Array & { length: 32 })
	{
		this.#bytes = new Uint8Array(bytes) as (Uint8Array & { length: 32});
	}

	static decode(r: CodecReader): DHPK { return new DHPK(r.bytes(32)); }
	encode(w: CodecWriter): void { w.bytes(this.#bytes); }

	get nativeKey(): Promise<DHPubKey>
	{
		return (async() => {
			this.#key ??= await importKey("raw",
				this.#bytes,
				{name: "X25519"},
				true,
				[]);
			return this.#key;
		})();
	}
}

// Wrap the functionality properly with custom types / objects.
export class DHPair {
	#pair?: DHKeyPair;
	#bytes?: Uint8Array & { length: 32 }; // pk bytes

	private constructor() {}

	static async generate(): Promise<DHPair>
	{
		const key = await generateKey({name: "X25519"}, true, ["deriveKey"]);
		let pair = new DHPair;
		pair.#pair = key;
		let bytes = await exportKey("raw", pair.#pair.publicKey);
		pair.#bytes = bytes as (Uint8Array & {length: 32});
		return pair;
	}

	async deriveSharedKey(key: DHPK): Promise<AESGCMKey> {
		let secret = await deriveKey({name: "X25519", public: await key.nativeKey},
			this.#pair!.privateKey,
			{name: "AES-GCM", length: 256},
			true,
			["encrypt", "decrypt"]);

		return new AESGCMKey(secret);
	}

	static get PK_LENGTH(): 32 { return 32; }

	encode_pk(w: CodecWriter): void { w.bytes<32>(this.#bytes!); }
}

export class AESGCMKey implements SigVerifier {
	#key: AesGcmKey;

	constructor(key: AesGcmKey) { this.#key = key; }

	static get TAG_BITLENGTH(): 128 { return 128; }
	static get KEY_LENGTH(): 32 { return 32; }

	async encrypt(args: {
		message: Uint8Array,
		additionalData?: ArrayBuffer | Uint8Array | DataView,
		iv?: InitVector,
	}): Promise<{iv: InitVector, ciphertext: Uint8Array}> {
		if(args.iv && args.iv.bytes.length !== InitVector.LENGTH)
			throw new Error(`Invalid IV size: ${args.iv.bytes.length} != ${InitVector.LENGTH}`);

		let iv = args.iv ?? InitVector.random();
		return {
			iv: iv,
			ciphertext: new Uint8Array(await encrypt({
					name: "AES-GCM",
					iv: iv.bytes,
					additionalData: args.additionalData,
					tagLength: AESGCMKey.TAG_BITLENGTH
				},
				this.#key,
				args.message
			))
		};
	}

	async decrypt(args: {
		ciphertext: Uint8Array,
		additionalData?: ArrayBuffer | Uint8Array | DataView,
		iv: InitVector
	}): Promise<Uint8Array> {
		if(args.iv.bytes.length !== InitVector.LENGTH)
			throw new Error(`Invalid IV size: ${args.iv.bytes.length} != ${InitVector.LENGTH}`);

		return new Uint8Array(await decrypt({
				name: "AES-GCM",
				iv: args.iv.bytes,
				additionalData: args.additionalData,
				tagLength: AESGCMKey.TAG_BITLENGTH,
			},
			this.#key,
			args.ciphertext
		));
	}

	async serialise(): Promise<Uint8Array>
		{ return new Uint8Array(await exportKey("raw", this.#key)); }
	static async deserialise(key: Uint8Array): Promise<AESGCMKey>
	{
		if(key.length !== AESGCMKey.KEY_LENGTH)
			throw new Error(`Key is ${key.length} != ${AESGCMKey.KEY_LENGTH} bytes`);
		return new AESGCMKey(await importKey(
			"raw",
			key,
			{name: "AES-GCM"},
			true,
			["encrypt", "decrypt"]
		));
	}

	/*override - SigVerifier.verifySig - no 'override' for interfaces.*/
	async verifySig(sig: SignedMessage): Promise<Uint8Array | undefined> {
		if(!(sig.signature instanceof InitVector))
			return undefined;

		try {
			return await this.decrypt({
				ciphertext: sig.message,
				additionalData: undefined,
				iv: sig.signature
			});
		} catch(e) { return undefined; }
	}
}

export class InitVector extends Signature<"wildcard"> {
		constructor(
	public bytes: Uint8Array
		)
	{
		super();
		if(bytes.length != InitVector.LENGTH)
			throw new Error(`Invalid IV size: ${bytes.length} != ${InitVector.LENGTH}`);
	}

	static get LENGTH(): 12 { return 12; }

	static random(): InitVector
	{
		return new InitVector(getRandomValues(
			new Uint8Array(InitVector.LENGTH)));
	}

	override encode_impl(w: CodecWriter): void { w.bytes(this.bytes); }
	static decode_impl(r: CodecReader): InitVector
		{ return new InitVector(r.bytes(InitVector.LENGTH)); }

	override toString(): string { return toHex(this.bytes); }
	override toJSON(): string { return this.toString(); }
	override toBytes(): Uint8Array { return new Uint8Array(this.bytes); }
	override type(): "wildcard" { return "wildcard"; }
	override clone(): this
		{ return new InitVector(new Uint8Array(this.bytes)) as this; }
	override signatureType(): SignatureType { return SignatureType.Wildcard; }
}

_signatureDecoders.set(SignatureType.Wildcard, InitVector.decode_impl);