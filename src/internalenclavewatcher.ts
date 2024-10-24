// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EnclaveEvent, ErdstallEventHandler } from "./event";

export interface InternalEnclaveWatcher {
	on_internal: <EV extends EnclaveEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, never>,
	) => void;
	once_internal: <EV extends EnclaveEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, never>,
	) => void;
	off_internal: <EV extends EnclaveEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, never>,
	) => void;
}
