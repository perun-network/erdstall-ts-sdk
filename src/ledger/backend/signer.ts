// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";

// The generic signer interface. It is used to abstract over the different
// signing backends.
export interface Signer {
	signMessage(message: string | utils.Bytes): Promise<string>;
}
