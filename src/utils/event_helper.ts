// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EnclaveWatcher, ErdstallWatcher, ErdstallEvent } from "#erdstall";
import { isEnclaveEvent } from "#erdstall/enclave";
import { Backend } from "#erdstall/ledger/backend";

export const EventHelper = {
	within<B extends Backend>(
		ms: number,
		eventEmitter: EnclaveWatcher | ErdstallWatcher<B>,
		event: ErdstallEvent,
	): Promise<boolean> {
		let timeout: NodeJS.Timeout;
		let cb = () => {};
		const res = new Promise<boolean>((resolve, reject) => {
			timeout = setTimeout(reject, ms);
			cb = () => resolve(true);
			if (isEnclaveEvent(event)) {
				(eventEmitter as EnclaveWatcher).on(event, cb);
			} else {
				(eventEmitter as ErdstallWatcher<B>).on(event, cb);
			}
		});

		return res.finally(() => {
			clearTimeout(timeout);
			if (isEnclaveEvent(event)) {
				(eventEmitter as EnclaveWatcher).off(event, cb);
			} else {
				(eventEmitter as ErdstallWatcher<B>).off(event, cb);
			}
		});
	},
};
