// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ABIValue, customJSON } from "#erdstall/api/util";
import { Backend } from "#erdstall/ledger/backend";
import {
	jsonObject,
	Serializable,
	TypedJSON,
} from "#erdstall/export/typedjson";

const addressImpls = new Map<string, Serializable<Address<Backend>>>();

export function registerAddressType(
	typeName: string,
	typeClass: Serializable<Address<Backend>>,
) {
	addressImpls.set(typeName, typeClass);
}

export abstract class Address<B extends Backend> implements ABIValue {
	abstract ABIType(): string;
	abstract type(): Backend;
	abstract get key(): string;
	abstract equals(other: Address<Backend>): boolean;
	abstract toString(): string;
	abstract toJSON(): string;

	static ensure(addr: string | Address<Backend>): Address<Backend> {
		if (addr === undefined) return addr;
		if (addr instanceof Address) return addr;
		// TODO: This might fail if the address is not in proper JSON format.
		return Address.fromJSON(addr);
	}

	static fromJSON(js: any): Address<Backend> {
		let data = JSON.stringify(js.data);
		if (!addressImpls.has(js.type)) {
			throw new Error(`unknown address type ${js.type}`);
		}

		return TypedJSON.parse(data, addressImpls.get(js.type)!)!;
	}

	static toJSON(me: Address<Backend>): any {
		return {
			type: me.type(),
			data: me.toJSON(),
		};
	}
}

customJSON(Address);

export function addressKey(_addr: Address<Backend> | string): string {
	throw new Error("not implemented");
}
