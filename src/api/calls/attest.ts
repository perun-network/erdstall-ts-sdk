// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "#erdstall/export/typedjson";
import { ErdstallObject } from "#erdstall/api";

@jsonObject
export class Attest extends ErdstallObject {
	constructor() {
		super();
	}

	public objectType(): any {
		return Attest;
	}
	protected objectTypeName(): string {
		return "Attest";
	}
}
