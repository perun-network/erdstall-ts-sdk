// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallWatcher } from "#erdstall";
import { Address, ErdstallEvent } from "#erdstall/ledger";
import { Erdstall } from "./contracts/Erdstall";

export const ErrUnsupportedLedgerEvent = new Error(
	"unsupported ledger event encountered",
);
export const ErrErdstallContractNotConnected = new Error(
	"erdstall contract not connected",
);

// LedgerConnection describes the connection a client can have to the on-chain
// part of Erdstall.
export interface LedgerReader extends ErdstallWatcher {
	erdstall(): Address;
}

export class LedgerReadConn implements LedgerReader {
	readonly contract: Erdstall;
	private eventCache: Map<Function, (args: Array<any>) => void>;

	constructor(contract: Erdstall) {
		this.contract = contract;
		this.eventCache = new Map<Function, (args: Array<any>) => void>();
	}

	on(ev: ErdstallEvent, cb: Function): void {
		const wrappedCB = (args: Array<any>) => {
			cb(args);
		};
		this.eventCache.set(cb, wrappedCB);
		this.contract.on(ev, wrappedCB);
	}

	once(ev: ErdstallEvent, cb: Function): void {
		this.contract.once(ev, (args: Array<any>) => {
			cb(args);
		});
	}

	off(ev: ErdstallEvent, cb: Function): void {
		if (!this.eventCache.has(cb)) {
			return;
		}
		this.contract.off(ev, this.eventCache.get(cb)!);
		this.eventCache.delete(cb);
	}

	erdstall(): Address {
		return Address.fromString(this.contract.address);
	}
}