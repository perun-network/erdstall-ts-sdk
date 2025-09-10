// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Chain } from "#erdstall/ledger";
import { WildcardAddress } from "#erdstall/crypto/wildcard";
import { ethers } from "ethers";
import { toHex } from "#erdstall/utils/hexbytes";
import { CodecReader, CodecWriter } from "#erdstall/utils";

export enum AssetType {
	Fungible,
	NFT,
}

export function AssetTypeName(t: AssetType): string {
	switch (t) {
		case AssetType.Fungible:
			return "FUN";
		case AssetType.NFT:
			return "NFT";
	}
	throw new Error(`Unknown AssetType: ${t}`);
}

export class AssetID {
	// [Origin Chain][AssetType][ID LocalAsset] packed into fixed-size array.
	bytes: Uint8Array & { length: 35 };

	constructor(bytes: Uint8Array & { length: 35 }) {
		this.bytes = bytes;
		if (bytes.length != 35) throw new Error("Invalid byte length");
	}

	static erdstallUserToken(
		user: WildcardAddress,
		name32: Uint8Array,
	): Uint8Array {
		return ethers.getBytes(
			ethers.keccak256(new Uint8Array([...user.keyBytes, ...name32])),
		);
	}

	static fromMetadata(
		chain: Chain,
		type: AssetType,
		localID: Uint8Array,
	): AssetID {
		// There probably are better ways to do this.
		const view = new DataView(new ArrayBuffer(35));
		view.setUint16(0, chain, true);
		view.setUint8(2, type);
		const bytes = new Uint8Array(view.buffer);
		bytes.set(localID, 3);
		return new AssetID(bytes as Uint8Array & { length: 35 });
	}

	origin(): Chain {
		const origin = this.bytes[0] | (this.bytes[1] << 8);
		return origin as Chain;
	}

	type(): AssetType {
		return this.bytes[2] as AssetType;
	}

	localID(): Uint8Array {
		return this.bytes.slice(3);
	}

	cmp(other: AssetID): number {
		if (this.bytes.length != 35) throw new Error("Invalid AssetID size!");
		if (other.bytes.length != 35) throw new Error("Invalid AssetID size!");

		for (let i = 0; i < this.bytes.length; i++) {
			const x = this.bytes[i] - other.bytes[i];
			if (x) return x;
		}
		return 0;
	}

	toString(): string {
		return `${this.origin()}/${AssetTypeName(
			this.type(),
		)}/${toHex(this.localID(), "")}`;
	}

	encode(w: CodecWriter): void {
		w.bytes(this.bytes);
	}
	static decode(r: CodecReader): AssetID {
		return new AssetID(r.bytes(35));
	}
}
