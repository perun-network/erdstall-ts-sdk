// SPDX-License-Identifier: Apache-2.0
"use strict";

import { TypedJSON } from "#erdstall/export/typedjson";

export function customJSON(Type: any) {
	TypedJSON.mapType(Type, {
		deserializer: (json: string) =>
			json === null ? json : Type.fromJSON(json),
		serializer: (value: any) =>
			value === null ? value : Type.toJSON(value),
	} as any);
}
