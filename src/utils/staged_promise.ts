// SPDX-License-Identifier: Apache-2.0
"use strict";

export type StageName = "approve" | "deposit" | "withdraw";

export class Stage<T> {
	private done: Promise<void>;
	value: T;
	name: StageName;

	constructor(name: StageName, value: T, onFulfilled: Promise<void>) {
		this.name = name;
		this.value = value;
		this.done = onFulfilled;
	}

	async wait(): Promise<void> {
		return this.done;
	}
}

export class Stages<T> {
	private stages: Stage<T>[];

	constructor() {
		this.stages = [];
	}

	add(name: StageName, value: T): [(obj: T) => void, (obj: any) => void] {
		var resolve: () => void = () => {};
		var reject: (obj: any) => void = () => {};
		let stage = new Stage(
			name,
			value,
			new Promise<void>((res, rej) => {
				resolve = res;
				reject = rej;
			}),
		);
		this.stages.push(stage);
		return [resolve, reject];
	}

	async wait(): Promise<void> {
		if (!this.stages || this.stages.length === 0)
			return Promise.reject(new Error("no stages available"));
		return this.stages[this.stages.length - 1].wait();
	}

	*[Symbol.iterator](): Iterator<Stage<T>> {
		for (const value of this.stages) {
			yield value;
		}
	}
}
