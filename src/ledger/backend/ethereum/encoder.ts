// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ChainProofDesc, Encoder } from "#erdstall/ledger/backend/encoder";

export class EthereumEncoder implements Encoder<"ethereum"> {
	encode(desc: ChainProofDesc<"ethereum">): Uint8Array {
		throw new Error("Method not implemented.");
	}
}
