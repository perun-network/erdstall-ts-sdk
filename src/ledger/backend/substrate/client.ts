// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallBackendClient } from "#erdstall";
import { AttestationResult, ClientConfig } from "#erdstall/api/responses";
import { ErdstallEvent, ErdstallEventHandler } from "#erdstall/event";
import { Account } from "#erdstall/ledger/account";
import { Address } from "#erdstall/crypto";
import { Backend } from "#erdstall/ledger/backend/backends";
import { LocalAsset } from "#erdstall/ledger/assets";
import { WsProvider } from "@polkadot/api";

export class SubstrateClient implements ErdstallBackendClient<"substrate"> {
	protected readonly provider: WsProvider;

	constructor(wsProvider: URL) {
		this.provider = new WsProvider(wsProvider.toString());
	}

	on<EV extends ErdstallEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, "substrate">,
	): void {}
	once<EV extends ErdstallEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, "substrate">,
	): void {}
	off<EV extends ErdstallEvent>(
		ev: EV,
		cb: ErdstallEventHandler<EV, "substrate">,
	): void {}
	removeAllListeners(): void {}
	erdstall(): { chain: "substrate"; address: Address<"substrate"> }[] {
		throw new Error("Method not implemented.");
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
