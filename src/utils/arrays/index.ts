// SPDX-License-Identifier: Apache-2.0

export type TypedArray =
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array;

export function equalArray<T extends TypedArray>(x: T, y: T): boolean {
	return x.length === y.length && x.every((a, i) => y[i] === a);
}
