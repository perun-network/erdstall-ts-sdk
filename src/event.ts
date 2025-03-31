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

/**
 * ErdstallEvent is comprised of all the events related to Erdstall. These
 * include events which originate from the ledger as well as from Erdstall
 * itself.
 */
export type ErdstallEvent = LedgerEvent | EnclaveEvent;

export type { EnclaveEvent };


export class EventEmitter<Event> {
	#always: ((e:Event) => void)[] = [];
	#once: ((e:Event) => void)[] = [];
	// called whenever we either start having subscriptions or stop having subscriptions.
	#has_subscriptions?: (any: boolean) => void;
	#had_subscriptions: boolean = false;

	get has_subscriptions(): boolean { return this.#had_subscriptions; }

	constructor(has_subscriptions?: (any: boolean) => void)
		{ this.#has_subscriptions = has_subscriptions; }

	// if required, notify the event producer that we are listening or not.
	#update(): void
	{
		const has_subscriptions = !!(this.#always.length || this.#once.length);
		if(this.#had_subscriptions != has_subscriptions)
		{
			this.#had_subscriptions = has_subscriptions;
			this.#has_subscriptions?.(has_subscriptions);
		}
	}

	emit(e: Event): void
	{
		let once = this.#once;
		let always = this.#always;
		this.#once = [];

		for(let h of once) h(e);
		for(let h of always) h(e);

		this.#update();
	}

	once(h: (e:Event) => void): void
	{
		if(-1 === this.#once.indexOf(h))
		{
			this.#once.push(h);
			this.#update();
		}
	}

	on(h: (e:Event) => void): void
	{
		if(-1 === this.#always.indexOf(h))
		{
			this.#always.push(h);
			this.#update();
		}
	}

	off(h: (e:Event) => void): void
	{
		let i = this.#always.indexOf(h);
		if(i !== -1) this.#always.splice(i, 1);

		i = this.#once.indexOf(h);
		if(i !== -1) this.#once.splice(i, 1);
	}

	removeAllListeners(): void
	{
		this.#once = [];
		this.#always = [];
		this.#update();
	}

	newHandler(): EventHandler<Event>
		{ return new EventHandler<Event>(this); }
}

export class EventHandler<Event> {
	#emitter: EventEmitter<Event>;

	constructor(emitter: EventEmitter<Event>)
		{ this.#emitter = emitter; }

	on(h: (e: Event) => void): void
		{ this.#emitter.on(h); }
	off(h: (e: Event) => void): void
		{ this.#emitter.off(h); }
	once(h: (e: Event) => void): void
		{ this.#emitter.once(h); }
}

export class LedgerEventEmitters {
	Frozen = new EventEmitter<Frozen>;
	Deposited = new EventEmitter<Deposited>;
	Withdrawn = new EventEmitter<Withdrawn>;
	Challenged = new EventEmitter<Challenged>;
	ChallengeResponded = new EventEmitter<ChallengeResponded>;

	subscription_mask(): LedgerEventMask {
		return {
			Frozen: this.Frozen.has_subscriptions,
			Deposited: this.Deposited.has_subscriptions,
			Withdrawn: this.Withdrawn.has_subscriptions,
			Challenged: this.Challenged.has_subscriptions,
			ChallengeResponded: this.ChallengeResponded.has_subscriptions
		};
	}
}

export interface LedgerEventMask {
	Frozen: boolean;
	Deposited: boolean;
	Withdrawn: boolean;
	Challenged: boolean;
	ChallengeResponded: boolean;
}


export class LedgerEventHandlers {
	Frozen: EventHandler<Frozen>;
	Deposited: EventHandler<Deposited>;
	Withdrawn: EventHandler<Withdrawn>;
	Challenged: EventHandler<Challenged>;
	ChallengeResponded: EventHandler<ChallengeResponded>;

	constructor(e: LedgerEventEmitters)
	{
		this.Frozen = e.Frozen.newHandler();
		this.Deposited = e.Deposited.newHandler();
		this.Withdrawn = e.Withdrawn.newHandler();
		this.Challenged = e.Challenged.newHandler();
		this.ChallengeResponded = e.ChallengeResponded.newHandler();
	}
}

export class EnclaveEventEmitters {
	open = new EventEmitter<void>;
	close = new EventEmitter<void>;
	config = new EventEmitter<ClientConfig>;
	receipt = new EventEmitter<TxReceipt>;
	phaseshift = new EventEmitter<PhaseShift>;
	proof = new EventEmitter<BalanceProofs>;
	error = new EventEmitter<string | Error>;
};

export class EnclaveEventHandlers {
	open: EventHandler<void>;
	close: EventHandler<void>;
	config: EventHandler<ClientConfig>;
	receipt: EventHandler<TxReceipt>;
	phaseshift: EventHandler<PhaseShift>;
	proof: EventHandler<BalanceProofs>;
	error: EventHandler<string | Error>;

	constructor(e: EnclaveEventEmitters)
	{
		this.open = e.open.newHandler();
		this.close = e.close.newHandler();
		this.config = e.config.newHandler();
		this.receipt = e.receipt.newHandler();
		this.phaseshift = e.phaseshift.newHandler();
		this.proof = e.proof.newHandler();
		this.error = e.error.newHandler();
	}
};
