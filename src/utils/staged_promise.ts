// SPDX-License-Identifier: Apache-2.0
"use strict";

export type StageName = "approve" | "deposit" | "withdraw";

/**
 * Implements a single stage which can be awaited containing a result of the
 * type specified by the template type parameter.
 */
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

/**
 * Implements a multi stage operation where each stage contains a result
 * defined by the template type parameter.
 */
export class Stages<T> {
	private stages: Stage<T>[];

	constructor() {
		this.stages = [];
	}

	/**
	 * Adds a stage with the given name and value as a result.
	 *
	 * @param name - The name of the stage.
	 * @param value - The result of this stage.
	 * @returns A tuple containing the [resolve, reject] functions for this stage
	 * to trigger.
	 */
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

	/**
	 * Waits for the current active stage to finish.
	 */
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
