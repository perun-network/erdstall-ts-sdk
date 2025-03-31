// SPDX-License-Identifier: Apache-2.0

import {
	jsonMember, IJsonMemberOptions, TypedJSON, ITypedJSONSettings
} from "typedjson";
export * from "typedjson";

export function jsonU64Member(
	options?: IJsonMemberOptions,
): PropertyDecorator {
	return jsonMember({
		deserializer: (json) => (json === null ? json : BigInt(json)),
		serializer: (value) => (value === null ? value : value.toString()),
		...options,
	});
}
export function bigTo0xEven(b: bigint) {
	if(!b) return "";
	let digits = b.toString(16);
	if(digits.length & 1)
		digits = "0" + digits;
	return "0x" + digits;
}

export function jsonU256Member(
	options?: IJsonMemberOptions,
): PropertyDecorator {
	return jsonMember({
		deserializer: (json) => (json === null ? json : BigInt(json)),
		serializer: (value) => (value === null ? value : bigTo0xEven(value)),
		...options,
	});
}

export const JSONCfg: ITypedJSONSettings = {
	errorHandler(e: Error): void { throw e; }
}

TypedJSON.setGlobalConfig(JSONCfg);