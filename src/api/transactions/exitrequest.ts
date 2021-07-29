// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "typedjson";
import { ABIEncoder } from "#erdstall/api/util";
import { Transaction, registerTransactionType } from "./transaction";
import { Address } from "#erdstall/ledger";

const exitTypeName = "ExitRequest";

@jsonObject
export class ExitRequest extends Transaction {
	public txType() {
		return ExitRequest;
	}
	protected txTypeName(): string {
		return exitTypeName;
	}

	protected encodeABI(_e: ABIEncoder, _: Address): string {
		return "ErdstallExitRequest";
	}
}

registerTransactionType(exitTypeName, ExitRequest);
