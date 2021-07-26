// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction } from "./transaction";
import { Transfer } from "./transfer";
import { ExitRequest } from "./exitrequest";
import { Mint } from "./mint";
import { Trade } from "./trade";
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
	case "Trade":
		return TypedJSON.parse(data, Trade)!;
	default:
		throw new Error(`unknown type "${js.type}"`);
	}
};
