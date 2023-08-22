// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EnclaveWatcher, ErdstallWatcher, ErdstallEvent } from "#erdstall";
import { isEnclaveEvent } from "#erdstall/enclave";

export const EventHelper = {
	within(
		ms: number,
		eventEmitter: EnclaveWatcher | ErdstallWatcher<["ethereum"]>,
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
				(eventEmitter as ErdstallWatcher<["ethereum"]>).on(event, cb);
			}
		});

		return res.finally(() => {
			clearTimeout(timeout);
			if (isEnclaveEvent(event)) {
				(eventEmitter as EnclaveWatcher).off(event, cb);
			} else {
				(eventEmitter as ErdstallWatcher<["ethereum"]>).off(event, cb);
			}
		});
	},
};
