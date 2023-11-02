// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallEvent, ErdstallEventHandler } from "#erdstall";
import { Backend } from "#erdstall/ledger/backend";

export class OneShotEventCache<T extends ErdstallEvent, B extends Backend>
	implements Iterable<[T, ErdstallEventHandler<T, B>[]]>
{
	m: Map<T, ErdstallEventHandler<T, B>[]>;
	constructor() {
		this.m = new Map<T, ErdstallEventHandler<T, B>[]>();
	}

	set(key: T, cb: ErdstallEventHandler<T, B>): OneShotEventCache<T, B> {
		if (!this.m.has(key)) {
			this.m.set(key, [cb]);
			return this;
		}

		this.m.get(key)!.push(cb);
		return this;
	}

	has(key: T, val?: ErdstallEventHandler<T, B>): boolean {
		const events = this.m.get(key);
		if (events === undefined || !val) {
			return !!events;
		}

		return !!events.find((other) => other === val);
	}

	delete(key: T, val?: ErdstallEventHandler<T, B>): boolean {
		const events = this.m.get(key);
		if (events === undefined) {
			return false;
		}

		if (!val) {
			return this.m.delete(key);
		}

		const id = events.findIndex((other) => other === val);
		if (id === -1) {
			return false;
		}

		events.splice(id, 1);
		return true;
	}

	get(key: T): ErdstallEventHandler<T, B>[] | undefined {
		if (!this.m.has(key)) {
			return undefined;
		}

		const cbs = this.m.get(key);
		this.m.delete(key);
		return cbs;
	}

	*[Symbol.iterator](): Iterator<[T, ErdstallEventHandler<T, B>[]]> {
		for (const [key, cbs] of this.m) {
			yield [key, cbs];
		}
	}

	clear() {
		this.m.clear();
	}
}

export class EventCache<
	T extends ErdstallEvent,
	Bs extends Backend,
> extends OneShotEventCache<T, Bs> {
	constructor() {
		super();
	}

	get(key: T): ErdstallEventHandler<T, Bs>[] | undefined {
		return this.m.get(key);
	}
}
