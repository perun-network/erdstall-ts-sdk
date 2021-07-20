// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "#erdstall/api/object";
import { jsonObject, jsonMember } from "typedjson";

/** All incoming messages. */
@jsonObject
export class Result {
	@jsonMember(String) id?: string;
	@jsonMember(ErdstallObject) data?: ErdstallObject;
	@jsonMember(String) error?: string;

	constructor(id?: string, data?: ErdstallObject, error?: string) {
		this.id = id;
		this.data = data;
		this.error = error;
	}

	isResponse(): boolean {
		return Boolean(this.id);
	}
	payload(): ErdstallObject {
		if (this.error) throw new Error(this.error!);
		return this.data!;
	}
}
