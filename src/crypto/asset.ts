// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Chain } from "#erdstall/ledger/chain";

export class AssetID {
	// [Origin Chain][AssetType][ID LocalAsset] packed into fixed-size array.
	bytes: Uint8Array;

	constructor(bytes: Uint8Array) {
		this.bytes = bytes;
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
}
