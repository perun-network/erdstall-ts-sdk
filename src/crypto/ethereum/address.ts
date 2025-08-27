// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";
import { jsonObject } from "#erdstall/export/typedjson";
import { equalArray } from "#erdstall/utils/arrays";
import { ABIValue, customJSON } from "#erdstall/api/util";
import {
	Address,
	AddressType,
	registerAddressType,
	_addressDecoders,
	SigVerifier,
	SignedMessage,
} from "#erdstall/crypto";
import { toHex, parseHex } from "#erdstall/utils/hexbytes";
import { LocalAsset } from "#erdstall/ledger/assets";
import { CodecReader, CodecWriter } from "#erdstall/utils";
import { EthereumSignature } from "./signature";

@jsonObject
export class EthereumAddress
	extends Address<"ethereum">
	implements ABIValue, SigVerifier
{
	#value: Uint8Array;
	constructor(value: Uint8Array) {
		super();
		if (value.length !== 20)
			throw new Error(`Invalid length (${value.length}/20)`);
		this.#value = new Uint8Array(value); // explicit deep copy!
	}

	get keyBytes(): Uint8Array {
		return new Uint8Array([...this.#value]);
	}

	static fromLocalAsset(asset: LocalAsset): EthereumAddress {
		// Native tokens are the last 20 bytes of the LocalAsset
		let addr = new EthereumAddress(asset.id.slice(-20));
		if (!asset.id.slice(0, 12).every((x) => x == 0))
			throw new Error(`Invalid ethereum LocalAsset: ${toHex(asset.id)}`);
		return addr;
	}

	toLocalAsset(): LocalAsset {
		let bytes = new Uint8Array(32);
		bytes.set(this.#value, 12);
		return new LocalAsset(bytes);
	}

	static fromJSON(val: any): EthereumAddress {
		if (typeof val !== "string") {
			throw new Error("Expected to decode address from a string");
		}
		return new EthereumAddress(parseHex(val, "0x"));
	}

	static toJSON(me: EthereumAddress): any {
		return me.toJSON();
	}

	public toJSON(): any {
		return toHex(this.#value, "0x");
	}

	static fromString(addr: string): EthereumAddress {
		return EthereumAddress.fromJSON(addr);
	}

	static ensure(addr: string | EthereumAddress): EthereumAddress {
		if (addr === undefined) return addr;
		if (addr instanceof EthereumAddress) return addr;
		return EthereumAddress.fromString(addr);
	}

	override encode_impl(w: CodecWriter): void {
		w.bytes(this.#value);
	}
	static decode_impl(r: CodecReader): EthereumAddress {
		return new EthereumAddress(r.bytes(20));
	}

	type(): "ethereum" {
		return "ethereum";
	}
	override addressType(): AddressType {
		return AddressType.Ethereum;
	}

	override clone(): this {
		return new EthereumAddress(this.#value) as this;
	}

	toString(): string {
		return ethers.getAddress(ethers.hexlify(this.#value));
	}

	asABI(): any {
		return this.toString();
	}

	ABIType(): string {
		return "address";
	}

	isZero(): boolean {
		return this.#value.every((x) => x === 0);
	}

	equals(other: EthereumAddress): boolean {
		return equalArray(this.#value, other.#value);
	}

	async verifySig(s: SignedMessage): Promise<Uint8Array | undefined> {
		if (!(s.signature instanceof EthereumSignature)) return undefined;

		if (s.signature.verify(s.message, this)) return s.message;
		else return undefined;
	}
}

registerAddressType("ethereum", EthereumAddress);
_addressDecoders.set(AddressType.Ethereum, EthereumAddress.decode_impl);
customJSON(EthereumAddress);

export function addressKey(addr: EthereumAddress | string): string {
	return EthereumAddress.ensure(addr).key;
}
