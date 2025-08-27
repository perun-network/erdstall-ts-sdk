// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";
import {
	Address,
	AddressType,
	registerAddressType,
	_addressDecoders,
	SigVerifier,
	SignedMessage,
} from "#erdstall/crypto";
import { equalArray } from "#erdstall/utils/arrays";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import { CodecReader, CodecWriter } from "#erdstall/utils";
import { SubstrateSignature } from "./signature";

/**
 * This class implements an address representation and is used within the SDK
 * wherever an address is required.
 */
@jsonObject
export class SubstrateAddress
	extends Address<"substrate">
	implements SigVerifier
{
	#value: Uint8Array;
	constructor(value: Uint8Array) {
		super();
		this.#value = new Uint8Array(value); // explicit deep copy!
	}

	get keyBytes(): Uint8Array {
		return new Uint8Array(this.#value);
	}

	static fromJSON(val: any): SubstrateAddress {
		if (typeof val !== "string") {
			throw new Error("Expected to decode address from a string");
		}
		return new SubstrateAddress(decodeAddress(hexToU8a(val)));
	}

	toJSON(): string {
		return u8aToHex(this.#value);
	}

	override encode_impl(w: CodecWriter): void {
		w.bytes(this.#value);
	}
	static decode_impl(r: CodecReader): SubstrateAddress {
		return new SubstrateAddress(r.bytes(32));
	}

	static fromString(addr: string): SubstrateAddress {
		return new SubstrateAddress(decodeAddress(addr));
	}

	static ensure(addr: string | SubstrateAddress): SubstrateAddress {
		if (addr === undefined) return addr;
		if (addr instanceof SubstrateAddress) return addr;
		return SubstrateAddress.fromString(addr);
	}

	type(): "substrate" {
		return "substrate";
	}
	override addressType(): AddressType {
		return AddressType.Substrate;
	}

	toString(): string {
		return encodeAddress(this.#value);
	}

	equals(other: SubstrateAddress): boolean {
		return equalArray(this.#value, other.#value);
	}

	override clone(): this {
		return new SubstrateAddress(this.#value) as this;
	}

	async verifySig(s: SignedMessage): Promise<Uint8Array | undefined> {
		if (!(s.signature instanceof SubstrateSignature)) return undefined;

		if (s.signature.verify(s.message, this)) return s.message;
		else return undefined;
	}
}

registerAddressType("substrate", SubstrateAddress);
_addressDecoders.set(AddressType.Substrate, SubstrateAddress.decode);
customJSON(SubstrateAddress);

export function addressKey(addr: SubstrateAddress | string): string {
	return SubstrateAddress.ensure(addr).key;
}
