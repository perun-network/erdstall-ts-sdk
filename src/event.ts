// ErdstallEvent describes an event which was either a LedgerEvent or an
// EnclaveEvent. Furthermore it specifies the EventHandler signatures for each
// event.
"use strict";

import { LedgerEvent } from "./ledger/event";
import { EnclaveEvent } from "./enclave/event";

export type ErdstallEvent = LedgerEvent | EnclaveEvent;

type _eventHandlers = {
	Frozen: () => void;
	Deposited: () => void;
	Withdrawn: () => void;
	Challenged: () => void;
	ChallengeResponded: () => void;
	TokenTypeRegistered: () => void;
	TokenRegistered: () => void;

	open: () => void;
	close: () => void;
	config: () => void;
	receipt: () => void;
	phaseshift: () => void;
	proof: () => void;
	exitproof: () => void;
	error: () => void;
};

// ErdstallEventHandler looks up the concretely typed handler from the
// `_eventHandlers` type. If `enclave.Event` or `ledger.Event` get extended the
// compiler will require that the `_eventHandlers` type will be extended too.
//
// This is equivalent to checking the mapping: _eventHandlers -> ErdstallEvent
export type ErdstallEventHandler<T extends ErdstallEvent> = _eventHandlers[T];

// `_requireBijectiveHandlers` double checks that no superfluous entries are
// registered in the `_eventHandlers` type, which do not belong in either
// `LedgerEvent` or `EnclaveEvent`.
//
// This is equivalent of checking the mapping: Erdstall -> _eventHandlers
type _eventKeys = keyof _eventHandlers;
type _requireBijectiveHandlers<T extends _eventKeys> = ErdstallEventHandler<T>;

// `ErdstallEventHandler` and `_requireBijectiveHandlers` together ensure, that
// all occurrences of events and the extension/removal are tracked at compile
// time.
