// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "./object";
import { jsonObject, jsonMember } from "typedjson";

/** All incoming messages. */
@jsonObject export class Result {
	@jsonMember(String) id?: string;
	@jsonMember(ErdstallObject) data?: ErdstallObject;
	@jsonMember(String) error?: string;

	isResponse(): boolean { return Boolean(this.id); }
	payload(): ErdstallObject {
		if(this.error)
			throw new Error(this.error!);
		return this.data!;
	}
}
