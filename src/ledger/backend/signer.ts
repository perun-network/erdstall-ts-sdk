// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Backend } from "#erdstall/ledger/backend/backends";
import { BackendSignature } from "#erdstall";

// The generic signer interface. It is used to abstract over the different
// signing backends.
export interface Signer<B extends Backend> {
	signMessage(message: string | Uint8Array): Promise<BackendSignature<B>>;
}
