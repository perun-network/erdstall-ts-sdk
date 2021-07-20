// SPDX-License-Identifier: Apache-2.0
"use strict";

import { TypedJSON } from "typedjson";
import { Transaction } from "#erdstall/api/transactions";
import { ErdstallObject } from "#erdstall/api/object";
import * as calls from "#erdstall/api/calls";
import * as responses from "#erdstall/api/responses";

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
		case "BalanceProofs":
			return TypedJSON.parse(data, responses.BalanceProofs)!;
		default:
			throw new Error(`unknown type "${js.type}"`);
	}
};
