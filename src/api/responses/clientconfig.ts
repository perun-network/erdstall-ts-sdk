// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "../object";
import { jsonObject, jsonMember } from "typedjson";
import { Address } from "../../ledger";

@jsonObject
export class ClientConfig extends ErdstallObject {
	@jsonMember(Address) contract: Address;
	@jsonMember(String) networkID: string;
	@jsonMember(Number) powDepth: number;

	constructor(contract: Address, networkID: string, powDepth: number) {
		super();
		this.contract = contract;
		this.networkID = networkID;
		this.powDepth = powDepth;
	}

	protected objectType(): any { return ClientConfig; }
	protected objectTypeName(): string { return "ClientConfig"; }
}