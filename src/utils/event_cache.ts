// SPDX-License-Identifier: Apache-2.0
"use strict";

export class OneShotEventCache<T> implements Iterable<[T, Function[]]> {
	m: Map<T, Function[]>;
	constructor() {
		this.m = new Map<T, Function[]>();
	}

	set(key: T, cb: Function): OneShotEventCache<T> {
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

	get(key: T): Function[] | undefined {
		if (!this.m.has(key)) {
			return undefined;
		}

		const cbs = this.m.get(key);
		this.m.delete(key);
		return cbs;
	}

	*[Symbol.iterator](): Iterator<[T, Function[]]> {
		for (const [key, cbs] of this.m) {
			yield [key, cbs];
		}
	}

	clear() {
		this.m.clear();
	}
}

export class EventCache<T> extends OneShotEventCache<T> {
	constructor() {
		super();
	}

	get(key: T): Function[] | undefined {
		return this.m.get(key);
	}
}
