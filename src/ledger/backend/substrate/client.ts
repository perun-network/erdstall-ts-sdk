// SPDX-License-Identifier: Apache-2.0
"use strict";

import { AttestationResult, ClientConfig } from "#erdstall/api/responses";
import { ErdstallEvent, LedgerEventMask } from "#erdstall/event";
import { Account } from "#erdstall/ledger/account";
import { Address } from "#erdstall/crypto";
import { LocalAsset } from "#erdstall/ledger/assets";
import { ChainClient } from "#erdstall/client";
import { WsProvider } from "@polkadot/api";

export class SubstrateClient extends ChainClient {
	protected readonly provider: WsProvider;

	constructor(wsProvider: URL) {
		super();
		this.provider = new WsProvider(wsProvider.toString());
	}

	initialize(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	subscribe(who?: Address<"substrate"> | undefined): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getAccount(who: Address<"substrate">): Promise<Account> {
		throw new Error("Method not implemented.");
	}
	attest(): Promise<AttestationResult> {
		throw new Error("Method not implemented.");
	}

	override update_event_tracking(mask: LedgerEventMask): void
	{
		throw new Error("not implemented");
	}
}

export function mkDefaultSubstrateClientConstructor(): {
	backend: "substrate";
	arg: URL;
	initializer: (c: ClientConfig) => SubstrateClient;
} {
	const ret: {
		backend: "substrate";
		arg: URL;
		initializer: (c: ClientConfig) => SubstrateClient;
	} = {
		backend: "substrate",
		arg: new URL("wss://rpc-rococo.bajun.network"),
		initializer: (_c: ClientConfig) => new SubstrateClient(ret.arg),
	};
	return ret;
}
