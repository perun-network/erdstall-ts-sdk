// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";
import {
	Address,
	AddressType,
	registerAddressType,
	_addressDecoders,
} from "#erdstall/crypto";
import { CodecReader, CodecWriter } from "#erdstall/utils";

@jsonObject
export class WildcardAddress extends Address<"wildcard"> {
	#id: bigint;

	constructor(id: bigint) {
		super();
		if (id >> 64n) throw new Error(`ID not a uint64: ${id}`);
		this.#id = BigInt(id);
	}

	override type(): "wildcard" {
		return "wildcard";
	}
	override addressType(): AddressType {
		return AddressType.Wildcard;
	}
	override equals(other: WildcardAddress): boolean {
		return this.#id == other.#id;
	}
	override toString(): string {
		return this.#id.toString();
	}
	override toJSON(): string {
		return this.#id.toString(16);
	}
	override get keyBytes(): Uint8Array {
		let x = new Uint8Array(8);
		new DataView(x).setBigUint64(0, this.#id, true);
		return x;
	}
	override clone(): this {
		return new WildcardAddress(this.#id) as this;
	}

	override encode_impl(w: CodecWriter): void {
		w.u64(this.#id);
	}
	static decode_impl(r: CodecReader): WildcardAddress {
		return new WildcardAddress(r.u64());
	}

	static fromJSON(val: any): WildcardAddress {
		if (typeof val !== "string") {
			throw new Error("Expected to decode address from a string");
		}
		return new WildcardAddress(BigInt(val));
	}
	static toJSON(me: WildcardAddress): any {
		return me.toJSON();
	}
	static fromString(addr: string): WildcardAddress {
		return new WildcardAddress(BigInt(addr));
	}
}

registerAddressType("wildcard", WildcardAddress);
_addressDecoders.set(AddressType.Wildcard, WildcardAddress.decode_impl);
customJSON(WildcardAddress);
