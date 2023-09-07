// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallClient } from "#erdstall";
import { AttestationResult, ClientConfig } from "#erdstall/api/responses";
import { ErdstallEvent, ErdstallEventHandler } from "#erdstall/event";
import { Account } from "#erdstall/ledger/account";
import { Address } from "#erdstall/ledger/address";
import { OnChainQuerier } from "#erdstall/ledger/onChainQuerier";
import { Backend } from "#erdstall/ledger/backend/backends";
import { NFTMetadata } from "#erdstall/ledger/backend/metadata";
import { TokenProvider } from "#erdstall/ledger/backend/tokenprovider";

export class SubstrateClient implements ErdstallClient<["substrate"]> {
	readonly tokenProvider: TokenProvider<"substrate">;
	readonly onChainQuerier: OnChainQuerier<["substrate"]>;

	constructor(arg: number) {
		console.log("SUBSTRATECONSTRUCTOR: {}", arg);
		throw new Error("not implemented");
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
	erdstall(): { chain: "substrate"; address: Address<Backend> } {
		throw new Error("Method not implemented.");
	}
	initialize(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	subscribe(who?: Address<Backend> | undefined): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getNftMetadata(
		backend: "substrate",
		token: Address<Backend>,
		id: bigint,
		useCache?: boolean | undefined,
	): Promise<NFTMetadata> {
		throw new Error("Method not implemented.");
	}
	getAccount(who: Address<Backend>): Promise<Account> {
		throw new Error("Method not implemented.");
	}
	attest(): Promise<AttestationResult> {
		throw new Error("Method not implemented.");
	}
}

export function mkDefaultSubstrateClientConstructor(): {
	backend: "substrate";
	arg: number;
	initializer: (c: ClientConfig) => SubstrateClient;
} {
	const arg = 420;
	return {
		backend: "substrate",
		arg: arg,
		initializer: (_c: ClientConfig) => new SubstrateClient(arg),
	};
}
