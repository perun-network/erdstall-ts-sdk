// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Depositor, Withdrawer } from "#erdstall";
import { Backend, LedgerReader } from "#erdstall/ledger/backend";

// The generic LedgerWriter used to interface with the ledger Erdstall is
// connected to. Each backend must provide an implementation of this interface.
export interface LedgerWriter<Bs extends Backend[]>
	extends LedgerReader<Bs>,
		Depositor<Bs>,
		Withdrawer<Bs> {}
