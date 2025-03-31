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

export abstract class EnclaveEvent {}