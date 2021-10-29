// SPDX-License-Identifier: Apache-2.0

import { jsonMember } from "typedjson";
export * from "typedjson";

export function jsonBigIntMember(): PropertyDecorator {
	return jsonMember({
		deserializer: (json) => (json === null ? json : BigInt(json)),
		serializer: (value) => (value === null ? value : value.toString()),
	});
}
