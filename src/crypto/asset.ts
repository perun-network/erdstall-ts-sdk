// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Chain } from "#erdstall/ledger";
import { Address, Crypto } from "#erdstall/crypto";
import { ethers } from "ethers";
import { toHex } from "#erdstall/utils/hexbytes";


export enum AssetType {
	Fungible,
	NFT
}

export function AssetTypeName(t: AssetType): string {
	switch(t)
	{
	case AssetType.Fungible: return "FUN";
	case AssetType.NFT: return "NFT";
	}
	throw new Error(`Unknown AssetType: ${t}`);
}

export class AssetID {
	// [Origin Chain][AssetType][ID LocalAsset] packed into fixed-size array.
	bytes: Uint8Array;

	constructor(bytes: Uint8Array) {
		this.bytes = bytes;
	}

	static erdstallUserToken(
		user: Address<Crypto>,
		name32: Uint8Array,
	): Uint8Array {
		return ethers.getBytes(ethers.keccak256(
			new Uint8Array([...user.keyBytes, ...name32]),
		));
	}

	static fromMetadata(
		chain: Chain,
		type: AssetType,
		localID: Uint8Array,
	): AssetID {
		const bytes = new Uint8Array(3 + localID.length);
		bytes[0] = chain & 0xff;
		bytes[1] = chain >> 8;
		bytes[2] = type;
		bytes.set(localID, 3);
		return new AssetID(bytes);
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
		if(this.bytes.length != 35) throw new Error("Invalid AssetID size!");
		if(other.bytes.length != 35) throw new Error("Invalid AssetID size!");

		for(let i = 0; i < this.bytes.length; i++) {
			const x = this.bytes[i] - other.bytes[i];
			if(x) return x;
		}
		return 0;
	}

	toString(): string {
		return `${
			this.origin()
		}/${
			AssetTypeName(this.type())
		}/${toHex(this.localID(), "")}`;
	}
}