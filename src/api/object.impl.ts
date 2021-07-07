// SPDX-License-Identifier: Apache-2.0
"use strict";

import { TypedJSON } from "typedjson";
import { Transaction } from "./transactions";
import { ErdstallObject } from "./object";
import * as calls from "./calls";
import * as responses from "./responses";

ErdstallObject.fromJSON = (js: any): ErdstallObject => {
	let data = JSON.stringify(js.data);

	switch (js.type) {
		case "Transaction":
			return TypedJSON.parse(data, Transaction)!;
		case "SubscribeTXs":
			return TypedJSON.parse(data, calls.SubscribeTXs)!;
		case "SubscribeBalanceProofs":
			return TypedJSON.parse(data, calls.SubscribeBalanceProofs)!;
		case "GetAccount":
			return TypedJSON.parse(data, calls.GetAccount)!;
		case "TxReceipt":
			return TypedJSON.parse(data, responses.TxReceipt)!;
		case "ClientConfig":
			return TypedJSON.parse(data, responses.ClientConfig)!;
		case "AccountResponse":
			return TypedJSON.parse(data, responses.Account)!;
		case "BalanceProof":
			return TypedJSON.parse(data, responses.BalanceProof)!;
		default:
			throw new Error(`unknown type "${js.type}"`);
	}
};
