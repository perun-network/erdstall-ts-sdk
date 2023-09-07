// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { Backend } from "#erdstall/ledger/backend/backends";
import { Signature } from "#erdstall/ledger";

// The generic signer interface. It is used to abstract over the different
// signing backends.
export interface Signer<B extends Backend> {
	signMessage(message: string | utils.Bytes): Promise<Signature<B>>;
}
