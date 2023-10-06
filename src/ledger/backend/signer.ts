// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { Backend } from "#erdstall/ledger/backend/backends";
import { BackendSignature } from "#erdstall";

// The generic signer interface. It is used to abstract over the different
// signing backends.
export interface Signer<B extends Backend> {
	signMessage(message: string | utils.Bytes): Promise<BackendSignature<B>>;
}
