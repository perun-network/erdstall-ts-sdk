// SPDX-License-Identifier: Apache-2.0
"use strict";

export function withTimeout<T>(
	ms: number,
	promise: Promise<T>,
): Promise<T | unknown> {
	const timeout = new Promise((_, reject) => {
		setTimeout(() => reject(new Error("Timeout")), ms);
	});
	return Promise.race([promise, timeout]);
}

export function* range(n: number, from: number = 0): Generator<number> {
	for (let i = 0; i < n; i++) yield from + i;
}
