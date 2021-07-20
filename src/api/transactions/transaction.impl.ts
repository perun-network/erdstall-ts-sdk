// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction } from "#erdstall/api/transactions/transaction";
import { Transfer } from "#erdstall/api/transactions/transfer";
import { ExitRequest } from "#erdstall/api/transactions/exitrequest";
import { Mint } from "#erdstall/api/transactions/mint";
import { TypedJSON } from "typedjson";

Transaction.fromJSON = (js: any): Transaction => {
	let data = JSON.stringify(js.data);

	switch (js.type) {
		case "Transfer":
			return TypedJSON.parse(data, Transfer)!;
		case "Mint":
			return TypedJSON.parse(data, Mint)!;
		case "ExitRequest":
			return TypedJSON.parse(data, ExitRequest)!;
		default:
			throw new Error(`unknown type "${js.type}"`);
	}
};
