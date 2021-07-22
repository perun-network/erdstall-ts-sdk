// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "typedjson";
import { ABIEncoder } from "#erdstall/api/util";
import { Transaction } from "./transaction";

@jsonObject
export class ExitRequest extends Transaction {
	public txType() {
		return ExitRequest;
	}
	protected txTypeName(): string {
		return "ExitRequest";
	}

	protected encodeABI(e: ABIEncoder): string {
		return "ErdstallExitRequest";
	}
}
