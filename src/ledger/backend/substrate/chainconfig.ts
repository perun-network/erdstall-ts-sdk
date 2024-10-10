// SPDX-License-Identifier: Apache-2.0
"use strict";

export class SubstrateChainConfig {
	blockStreamLAddr: string;

	constructor(blockStreamLAddr: string) {
		this.blockStreamLAddr = blockStreamLAddr;
	}

	clone() {
		return new SubstrateChainConfig(this.blockStreamLAddr);
	}
}
