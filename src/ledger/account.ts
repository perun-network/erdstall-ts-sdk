// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ChainAssets } from "#erdstall/ledger/assets";
import { CodecReader, CodecWriter } from "#erdstall/utils";

/**
 * Account is the state of a user within Erdstall, including the last nonce and
 * free locked assets. It is returned by an `EnclaveReader.getAccount` query.
 */
export class Account {
	constructor(
		public nonce: bigint,
		public values: ChainAssets,
	) {}

	encode(w: CodecWriter): void {
		w.u64(this.nonce);
		this.values.encode(w);
	}
	static decode(r: CodecReader): Account {
		return new Account(r.u64(), ChainAssets.decode(r));
	}
}
