// LedgerEvent describes all on-chain events related to Erdstall, which are emitted
// by the ledger backends.
"use strict";

const event = [
	"Frozen",
	"Deposited",
	"Withdrawn",
	"Challenged",
	"ChallengeResponded",
	"TokenTypeRegistered",
	"TokenRegistered",
] as const;

export type LedgerEvent = typeof event[number];

export function isLedgerEvent(v: any): v is LedgerEvent {
	return event.includes(v);
}
