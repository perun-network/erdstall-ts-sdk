// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";

const txAcceptedTypeName = "TxAccepted";

@jsonObject
export class TxAccepted extends ErdstallObject {
	@jsonMember(String) hash: string;
	constructor(hash: string) {
		super();
		this.hash = hash;
	}

	public objectType(): any {
		return TxAccepted;
	}
	override objectTypeName(): string {
		return txAcceptedTypeName;
	}
}

registerErdstallType(txAcceptedTypeName, TxAccepted);
