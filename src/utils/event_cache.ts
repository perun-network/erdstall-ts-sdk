// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallEvent, ErdstallEventHandler } from "#erdstall";

export class OneShotEventCache<T extends ErdstallEvent>
	implements Iterable<[T, ErdstallEventHandler<T>[]]>
{
	m: Map<T, ErdstallEventHandler<T>[]>;
	constructor() {
		this.m = new Map<T, ErdstallEventHandler<T>[]>();
	}

	set(key: T, cb: ErdstallEventHandler<T>): OneShotEventCache<T> {
		if (!this.m.has(key)) {
			this.m.set(key, [cb]);
			return this;
		}

		this.m.get(key)!.push(cb);
		return this;
	}

	has(key: T): boolean {
		return this.m.has(key);
	}

	get(key: T): ErdstallEventHandler<T>[] | undefined {
		if (!this.m.has(key)) {
			return undefined;
		}

		const cbs = this.m.get(key);
		this.m.delete(key);
		return cbs;
	}

	*[Symbol.iterator](): Iterator<[T, ErdstallEventHandler<T>[]]> {
		for (const [key, cbs] of this.m) {
			yield [key, cbs];
		}
	}

	clear() {
		this.m.clear();
	}
}

export class EventCache<T extends ErdstallEvent> extends OneShotEventCache<T> {
	constructor() {
		super();
	}

	get(key: T): ErdstallEventHandler<T>[] | undefined {
		return this.m.get(key);
	}
}
