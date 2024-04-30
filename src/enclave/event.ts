// Event describes all on-chain events related to Erdstall, which are emitted
// by the ledger backends.
"use strict";

const event = [
	"open",
	"close",
	"config",
	"receipt",
	"phaseshift",
	"proof",
	"error",
] as const;

/**
 * All event names which can be listened for and are emitted by the enclave
 * running Erdstall.
 */
export type EnclaveEvent = typeof event[number];

export function isEnclaveEvent(v: any): v is EnclaveEvent {
	return event.includes(v);
}
