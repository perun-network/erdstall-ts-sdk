// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallEventHandler } from "#erdstall/event";
import { Address, LedgerEvent } from "#erdstall/ledger";
import { LedgerReader, NFTMetadata } from "#erdstall/ledger/backend";

export class LedgerReadConn implements LedgerReader<["substrate"]> {
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

	getNftMetadata(
		backend: "substrate",
		token: Address,
		id: bigint,
		useCache?: boolean | undefined,
	): Promise<NFTMetadata> {
		throw new Error("Method not implemented.");
	}

	erdstall(): { chain: "substrate"; address: Address } {
		throw new Error("Method not implemented.");
	}
}
