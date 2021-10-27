// SPDX-License-Identifier: Apache-2.0
"use strict";

export function* range(n: number, from: number = 0): Generator<number> {
	for (let i = 0; i < n; i++) yield from + i;
}
