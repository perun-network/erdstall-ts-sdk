// SPDX-License-Identifier: Apache-2.0
"use strict";

export class SubstrateChainConfig {
	blockStreamLAddr: string;

	constructor(blockStreamLAddr: string) {
		this.blockStreamLAddr = blockStreamLAddr;
	}

	clone(): this {
		return new SubstrateChainConfig(this.blockStreamLAddr) as this;
	}

	type(): "substrate" {
		return "substrate";
	}

	toJSON(): { blockStreamLAddr: string } {
		return { blockStreamLAddr: this.blockStreamLAddr };
	}
}
