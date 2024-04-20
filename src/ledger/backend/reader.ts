// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallWatcher, Contracter } from "#erdstall";
import { Backend } from "#erdstall/ledger/backend";

// The generic LedgerReader used to interface with the ledger Erdstall is
// connected to. Each backend must provide an implementation of this interface.
export interface LedgerReader<B extends Backend>
	extends	ErdstallWatcher<B>,
		Contracter<B> {}
