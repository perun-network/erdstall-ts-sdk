// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction } from "./transaction";
import { jsonObject } from "typedjson";
import { ABIEncoder } from "../util";

@jsonObject export class ExitRequest extends Transaction {
	public txType() { return ExitRequest; }
	protected txTypeName(): string { return "ExitRequest"; }

	protected encodeABI(e: ABIEncoder): string {
		return "ErdstallExitRequest";
	}
}
