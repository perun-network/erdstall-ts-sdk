// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer as EthersSigner } from "ethers";
import { Signer } from "#erdstall/ledger/backend";

// Compile-time check that the EthersSigner implements the Signer interface.
export abstract class EthereumSigner
	extends EthersSigner
	implements Signer<"ethereum"> {}
