// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallEventHandler } from "#erdstall/event";
import { LedgerEvent } from "#erdstall/ledger";
import { LocalAsset } from "#erdstall/ledger/assets";
import { Address } from "#erdstall/crypto";
import { Backend, LedgerReader } from "#erdstall/ledger/backend";

export class LedgerReadConn implements LedgerReader<"substrate"> {
	readonly pallet: any;

	constructor() {}

	on<EV extends LedgerEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, "substrate">,
	): void {
		return;
	}

	once<EV extends LedgerEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, "substrate">,
	): void {
		return;
	}

	off<EV extends LedgerEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, "substrate">,
	): void {
		return;
	}

	removeAllListeners(): void {
		return;
	}

	erdstall(): { chain: "substrate"; address: Address<"substrate"> }[] {
		throw new Error("Method not implemented.");
	}
}
