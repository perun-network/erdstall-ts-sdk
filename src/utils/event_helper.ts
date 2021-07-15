// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EnclaveWatcher, ErdstallWatcher } from "../";
import EnclaveEvent, { isEnclaveEvent } from "../enclave/event";
import ErdstallEvent from "../ledger/event";

export const EventHelper = {
	within(
		ms: number,
		eventEmitter: EnclaveWatcher | ErdstallWatcher,
		event: EnclaveEvent | ErdstallEvent,
	): Promise<boolean> {
		let timeout: NodeJS.Timeout;
		let cb: Function;
		const res = new Promise<boolean>((resolve, reject) => {
			timeout = setTimeout(reject, ms);
			cb = () => resolve(true);
			if (isEnclaveEvent(event)) {
				(eventEmitter as EnclaveWatcher).on(event, cb);
			} else {
				(eventEmitter as ErdstallWatcher).on(event, cb);
			}
		});

		return res.finally(() => {
			clearTimeout(timeout);
			if (isEnclaveEvent(event)) {
				(eventEmitter as EnclaveWatcher).off(event, cb);
			} else {
				(eventEmitter as ErdstallWatcher).off(event, cb);
			}
		});
	},
};
