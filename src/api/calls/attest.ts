// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";

export class Attest extends ErdstallObject {
	override objectType(): any {
		return Attest;
	}
	override objectTypeName(): string {
		return "Attest";
	}

	override encode(): void { }
	static decode(): Attest {
		return new Attest();
	}
}
registerErdstallType("Attest", Attest);
