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

type ErdstallEvent = typeof event[number];

export function isLedgerEvent(v: any): v is ErdstallEvent {
	return event.includes(v);
}

export default ErdstallEvent;
