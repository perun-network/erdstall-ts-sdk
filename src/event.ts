// ErdstallEvent describes an event which was either a LedgerEvent or an
// EnclaveEvent. Furthermore it specifies the EventHandler signatures for each
// event.
"use strict";

import {
	LedgerEvent,
	Withdrawn,
	Deposited,
	Frozen,
	Challenged,
	ChallengeResponded,
} from "./ledger";
import { EnclaveEvent } from "./enclave/event";
import {
	ClientConfig,
	TxReceipt,
	BalanceProofs,
	PhaseShift,
} from "./api/responses";
import { Backend } from "./ledger/backend";

/**
 * ErdstallEvent is comprised of all the events related to Erdstall. These
 * include events which originate from the ledger as well as from Erdstall
 * itself.
 */
export type ErdstallEvent = LedgerEvent | EnclaveEvent;

export type { EnclaveEvent };

type _eventHandlers<B extends Backend> = {
	Frozen: (ev: Frozen<B>) => void;
	Deposited: (ev: Deposited<B>) => void;
	Withdrawn: (ev: Withdrawn<B>) => void;
	Challenged: (ev: Challenged<B>) => void;
	ChallengeResponded: (ev: ChallengeResponded<B>) => void;

	open: () => void;
	close: () => void;
	config: (config: ClientConfig) => void;
	receipt: (receipt: TxReceipt) => void;
	phaseshift: (phaseShift: PhaseShift) => void;
	proof: (proof: BalanceProofs) => void;
	error: (error: string | Error) => void;
};

/**
 * ErdstallEventHandler looks up the concretely typed handler from the
 * `_eventHandlers` type. If `enclave.Event` or `ledger.Event` get extended the
 * compiler will require that the `_eventHandlers` type will be extended too.
 * This is equivalent to checking the mapping:
 * `_eventHandlers` -> `ErdstallEvent`
 */
export type ErdstallEventHandler<
	T extends ErdstallEvent,
	Bs extends Backend,
> = _eventHandlers<Bs>[T];

/**
 * `_requireBijectiveHandlers` double checks that no superfluous entries are
 * registered in the `_eventHandlers` type, which do not belong in either
 * `LedgerEvent` or `EnclaveEvent`.
 *
 * This is equivalent of checking the mapping:
 * `ErdstallEvent` -> `_eventHandlers`
 */
type _eventKeys<Bs extends Backend> = keyof _eventHandlers<Bs>;
type _requireBijectiveHandlers<
	T extends _eventKeys<Bs>,
	Bs extends Backend,
> = ErdstallEventHandler<T, Bs>;

// `ErdstallEventHandler` and `_requireBijectiveHandlers` together ensure, that
// all occurrences of events and the extension/removal of event names are
// tracked at compile time.
