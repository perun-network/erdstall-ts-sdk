// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "./object";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";

@jsonObject
export class Call {
	@jsonMember(String) id: string;
	@jsonMember(() => ErdstallObject) data: ErdstallObject;

	constructor(id: string, data: ErdstallObject) {
		this.id = id;
		this.data = data;
	}
}
