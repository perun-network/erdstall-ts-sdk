// SPDX-License-Identifier: Apache-2.0
"use strict";

import { customJSON } from "#erdstall/api/util";
import { Crypto } from "#erdstall/crypto";
import { Serializable, TypedJSON } from "#erdstall/export/typedjson";

const addressImpls = new Map<string, Serializable<Address<Crypto>>>();

export function registerAddressType(
	typeName: string,
	typeClass: Serializable<Address<Crypto>>,
) {
	addressImpls.set(typeName, typeClass);
}

export abstract class Address<_C extends Crypto = Crypto> {
	abstract type(): _C;
	get key(): string { return JSON.stringify(Address.toJSON(this)); }
	abstract equals(other: Address<_C>): boolean;
	abstract toString(): string;
	abstract toJSON(): string;
	abstract get keyBytes(): Uint8Array;

	abstract clone(): this;

	static ensure(addr: string | Address<Crypto>): Address<Crypto> {
		if (addr === undefined) return addr;
		if (addr instanceof Address) return addr;
		return Address.fromJSON(JSON.parse(addr));
	}

	static fromJSON({data, type}: {data: any, type: string}): Address<Crypto> {
		if (!addressImpls.has(type)) {
			throw new Error(`unknown address type ${type}`);
		}

		return TypedJSON.parse(JSON.stringify(data), addressImpls.get(type)!)!;
	}

	static toJSON(me: Address<Crypto>): any {
		return {
			type: me.type(),
			data: me.toJSON(),
		};
	}
}

customJSON(Address);

export function addressKey(_addr: Address<Crypto> | string): string {
	throw new Error("not implemented");
}
