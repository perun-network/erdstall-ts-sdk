// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonObject,
	TypedJSON,
	Serializable,
} from "#erdstall/export/typedjson";
import { customJSON } from "./util";

const objectImpls = new Map<string, Serializable<ErdstallObject>>();

export function registerErdstallType(
	typeName: string,
	typeClass: Serializable<ErdstallObject>,
) {
	objectImpls.set(typeName, typeClass);
}

/** Base type for all Erdstall messages. */
@jsonObject
export abstract class ErdstallObject {
	public abstract objectType(): Serializable<ErdstallObject>;
	protected abstract objectTypeName(): string;

	static fromJSON(js: any): ErdstallObject {
		let data = JSON.stringify(js.data);

		if (!objectImpls.has(js.type)) {
			throw new Error(`unknown erdstall object type "${js.type}"`);
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return TypedJSON.parse(data, objectImpls.get(js.type)!)!;
	}

	static toJSON(me: ErdstallObject) {
		return {
			type: me.objectTypeName(),
			data: JSON.parse(TypedJSON.stringify(me, me.objectType())),
		};
	}
}

customJSON(ErdstallObject);
