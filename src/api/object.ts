// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject, TypedJSON } from "typedjson";
import { CustomJSON } from "./util";


/** Base type for all Erdstall messages. */
@jsonObject export abstract class ErdstallObject {
	public static fromJSON: (js: any) => ErdstallObject;
	protected abstract objectType(): any;
	protected abstract objectTypeName(): string;

	static toJSON(me: ErdstallObject) {
		return {
			type: me.objectTypeName(),
			data: JSON.parse(TypedJSON.stringify(me, me.objectType())),
		};
	}
}

CustomJSON(ErdstallObject);