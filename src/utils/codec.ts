// SPDX-License-Identifier: Apache-2.0
"use strict";

// TODO: remove this once we can switch to base64 (Uint8Array.toBase64), ATM it is not widely implemented by browsers. Or we should directly switch to sending raw data over the websockets instead of text.
import { toHex, parseHex } from "#erdstall/utils/hexbytes";

export interface Encodable {
	encode(w: CodecWriter): void;
}

export class CodecVersion {
	constructor(
		public major: number,
		public extension: number,
		public global: number
	) {}

	encode(w: CodecWriter): void
		{ w.u16(this.major); w.u16(this.extension); w.u16(this.global); }
	static decode(r: CodecReader): CodecVersion
		{ return new CodecVersion(r.u16(), r.u16(), r.u16()); }
};

export const codecVersion = { major: 0, extension: 0, global: 1 };

export class CodecWriter {
	#bytes: ArrayBuffer = new (ArrayBuffer as any)(1024, {maxByteLength: 16 * 1024 * 1024});
	#progress: number = 0;

	prepare_write(size: number)
	{
		let min = this.#progress + size;
		if(this.#bytes.byteLength < min)
		{
			let grow = this.#bytes.byteLength + this.#bytes.byteLength >> 1;
			if(grow < min) grow = min;
			(this.#bytes as any).resize(grow);
		}
	}

	#view(skip: number): DataView
	{
		this.prepare_write(skip);
		const view = new DataView(this.#bytes, this.#progress);
		this.#progress += skip;
		return view;
	}

	u8(v: number)   { this.#view(1).setUint8(0, v); }
	bool(v: boolean | Object | undefined){ this.u8(v ? 1 : 0); }
	u16(v: number)  { this.#view(2).setUint16(0, v, true); }
	u64(v: bigint)  { this.#view(8).setBigUint64(0, v, true); }
	u256(v: bigint) {
		this.prepare_write(32);
		let dst = new Uint8Array(this.#bytes, this.#progress, 32);
		this.#progress += 32;
		for(let i = 0; i < 32; i++)
			dst[i] = Number((v >> BigInt(i * 8)) & 0xffn);
	}
	bytes<N extends number = number>(v: Uint8Array & { length: N }) {
		this.prepare_write(v.length);
		let dst = new Uint8Array(this.#bytes, this.#progress, v.length);
		this.#progress += v.length;
		dst.set(v);
	}

	array_with<T>(array: T[], encode: (obj: T, w: CodecWriter) => void): void
	{
		if(array.length > 0xffff)
			throw new Error(`Codec: cannot encode array of length ${array.length}`);
		this.u16(array.length);
		for(let it of array)
			encode(it, this);
	}

	map_with<K, V>(
		map: Map<K,V>,
		enc_k: (obj: K, w: CodecWriter) => void,
		enc_v: (obj: V, w: CodecWriter) => void): void
	{
		this.array_with(
			Array.from(map.entries()),
			([k, v]) => { enc_k(k, this); enc_v(v, this); });
	}

	u256_array(ints: bigint[]): void
		{ this.array_with(ints, (i) => this.u256(i)); }
	array<Enc extends Encodable>(encodables: Enc[]): void
		{ this.array_with(encodables, (e) => e.encode(this)); }

	opt_with<T>(v: T | undefined, enc: (v: T, w: CodecWriter) => void): void
	{
		this.bool(v !== undefined);
		if(v !== undefined)
			enc(v, this);
	}
	opt<Enc extends Encodable>(v: Enc | undefined): void
		{ this.opt_with(v, (v) => v.encode(this)); }

	get(): Uint8Array
	{
		(this.#bytes as any).resize(this.#progress);
		return new Uint8Array(this.#bytes, 0, this.#progress);
	}

	// TODO: migrate to base64 as soon as the client side supports it natively. Might also do a feature test and support both for a while.
	getAsString(): string { return toHex(this.get(), "0x"); }
};

export class CodecReader {
	#bytes: Uint8Array;
	#progress: number = 0;

	// TODO: migrate to base64 as soon as the client side supports it natively. Might also support both for a while, and having the client send whether it can handle base64 or not. It can then look for a 0x / 0b prefix. Or we should switch to raw websockets directly for everything.
	static fromString(str: string): CodecReader
		{ return new CodecReader(parseHex(str, "0x")); }
	constructor(bytes: Uint8Array) { this.#bytes = bytes; }

	#view(skip: number): DataView
	{
		const view = new DataView(this.#bytes, this.#progress);
		this.#progress += skip;
		return view;
	}

	u8(): number    { return this.#view(1).getUint8(0); }
	bool(): boolean { return this.u8() != 0; }
	u16(): number   { return this.#view(2).getUint16(0, true); }
	u64(): bigint   { return this.#view(8).getBigUint64(0, true); }
	u256(): bigint  {
		let src = new Uint8Array(this.#bytes, this.#progress, 32);
		this.#progress += 32;

		let ret = 0n;
		for(let i = 0; i < 32; i++)
			ret |= BigInt(src[i]) << BigInt(i*8);

		return ret;
	}
	bytes<N extends number = number>(n: N): Uint8Array & { length: N } {
		let src = new Uint8Array(this.#bytes, this.#progress, n);
		this.#progress += n;

		let dst = new Uint8Array(n);
		dst.set(src);
		return dst as (Uint8Array & { length: N });
	}

	u256_array(): bigint[] {
		return this.array<bigint>((r: CodecReader) => r.u256());
	}
	array<Dec>(decode: (r: CodecReader) => Dec): Dec[] {
		let ret: Dec[] = new Array(this.u16());
		for(let i = 0; i < ret.length; i++)
			ret[i] = decode(this);
		return ret;
	}
	opt<Dec>(decode: (r: CodecReader) => Dec): Dec | undefined
		{ return this.bool() ? decode(this) : undefined; }

	map<K, V>(
		dec_k: (r: CodecReader) => K,
		dec_v: (r: CodecReader) => V): Map<K, V>
	{
		return new Map<K,V>(this.array<[K, V]>(
			() => [dec_k(this), dec_v(this)]));
	}

	rest(): Uint8Array { return this.#bytes.subarray(this.#progress); }
};