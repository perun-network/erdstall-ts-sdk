// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";
import { Address } from "#erdstall/ledger";

const clientConfigTypeName = "ClientConfig";

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

	public objectType(): any {
		return ClientConfig;
	}
	protected objectTypeName(): string {
		return clientConfigTypeName;
	}
}

registerErdstallType(clientConfigTypeName, ClientConfig);
