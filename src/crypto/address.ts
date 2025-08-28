// SPDX-License-Identifier: Apache-2.0
"use strict";

import { customJSON } from "#erdstall/api/util";
import { Crypto } from "#erdstall/crypto";
import { Serializable, TypedJSON } from "#erdstall/export/typedjson";
import { CodecReader, CodecWriter } from "#erdstall/utils";

const addressImpls = new Map<string, Serializable<Address<Crypto>>>();

export function registerAddressType(
	typeName: string,
	typeClass: Serializable<Address<Crypto>>,
) {
	addressImpls.set(typeName, typeClass);
}
export const _addressDecoders = new Map<
	AddressType,
	(r: CodecReader) => Address
>();

export enum AddressType {
	Wildcard,
	Ethereum,
	Substrate,
}

export abstract class Address<_C extends Crypto = Crypto> {
	abstract type(): _C;
	abstract addressType(): AddressType;
	get key(): string {
		return JSON.stringify(Address.toJSON(this));
	}
	static fromKey(key: string) {
		return Address.fromJSON(JSON.parse(key));
	}
	abstract equals(other: Address<_C>): boolean;
	abstract toString(): string;
	abstract toJSON(): string;
	abstract get keyBytes(): Uint8Array;

	abstract clone(): this;

	abstract encode_impl(w: CodecWriter): void;
	static decode(r: CodecReader): Address {
		let t = r.u8() as AddressType;
		let dec = _addressDecoders.get(t);
		if (dec) return dec(r);
		else throw new Error(`Unknown address type ${t}`);
	}
	static encode(w: CodecWriter, v: Address): void {
		w.u8(v.addressType());
		v.encode_impl(w);
	}
	encode(w: CodecWriter): void {
		Address.encode(w, this);
	}

	static ensure(addr: string | Address<Crypto>): Address<Crypto> {
		if (addr === undefined) return addr;
		if (addr instanceof Address) return addr;
		return Address.fromJSON(JSON.parse(addr));
	}

	static fromJSON(obj: { [type: string]: string }): Address<Crypto> {
		let [type] = Object.keys(obj);
		let data = obj[type];
		if (!addressImpls.has(type)) {
			throw new Error(`unknown address type ${type}`);
		}

		return TypedJSON.parse(JSON.stringify(data), addressImpls.get(type)!)!;
	}

	static toJSON(me: Address<Crypto>): any {
		let type = me.type();
		return {
			[type]: me.toJSON()
		};
	}
}

customJSON(Address);

export function addressKey(_addr: Address<Crypto> | string): string {
	throw new Error("not implemented");
}
