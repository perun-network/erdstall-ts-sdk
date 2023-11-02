// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Chain } from "#erdstall/ledger/chain";

export class AssetID {
	// [Origin Chain][AssetType][ID LocalAsset] packed into fixed-size array.
	bytes: Uint8Array;

	constructor(bytes: Uint8Array) {
		this.bytes = bytes;
	}

	static fromMetadata(
		chain: Chain,
		type: number,
		localID: Uint8Array,
	): AssetID {
		const bytes = new Uint8Array(3 + localID.length);
		bytes[0] = chain >> 8;
		bytes[1] = chain & 0xff;
		bytes[2] = type;
		bytes.set(localID, 3);
		return new AssetID(bytes);
	}

	origin(): Chain {
		const origin = (this.bytes[0] + this.bytes[1]) << 8;
		return origin as Chain;
	}

	type(): number {
		return this.bytes[2];
	}

	localID(): Uint8Array {
		return this.bytes.slice(3);
	}

	cmp(other: AssetID): number {
		return compareByteStrings(this.bytes, other.bytes);
	}
}

// TODO: How is the bytes compare function in Go defined?
export function compareByteStrings(a: Uint8Array, b: Uint8Array): number {
	if (a.length !== b.length) {
		return a.length - b.length;
	}
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return a[i] - b[i];
		}
	}
	return 0;
}
