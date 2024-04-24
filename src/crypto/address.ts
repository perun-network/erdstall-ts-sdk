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

export abstract class Address<_C extends Crypto> {
	abstract type(): _C;
	abstract get key(): string;
	abstract equals(other: Address<_C>): boolean;
	abstract toString(): string;
	abstract toJSON(): string;

	static ensure(addr: string | Address<Crypto>): Address<Crypto> {
		if (addr === undefined) return addr;
		if (addr instanceof Address) return addr;
		return Address.fromJSON(addr);
	}

	static fromJSON(js: any): Address<Crypto> {
		if (typeof js === "string") {
			js = JSON.parse(js);
		}
		let data = JSON.stringify(js.data);

		if (!addressImpls.has(js.type)) {
			throw new Error(`unknown address type ${js.type}`);
		}

		return TypedJSON.parse(data, addressImpls.get(js.type)!)!;
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
