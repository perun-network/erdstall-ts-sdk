// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallClient } from "#erdstall";
import { AttestationResult } from "#erdstall/api/responses";
import { ErdstallEvent, ErdstallEventHandler } from "#erdstall/event";
import { Account } from "#erdstall/ledger/account";
import { Address } from "#erdstall/ledger/address";
import { OnChainQuerier } from "#erdstall/ledger/onChainQuerier";
import { Erdstall } from "../ethereum";
import { NFTMetadata } from "../metadata";
import { TokenProvider } from "../tokenprovider";

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
	erdstall(): { chain: "substrate"; address: Address } {
		throw new Error("Method not implemented.");
	}
	initialize(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	subscribe(who?: Address | undefined): Promise<void> {
		throw new Error("Method not implemented.");
	}
	getNftMetadata(
		backend: "substrate",
		token: Address,
		id: bigint,
		useCache?: boolean | undefined,
	): Promise<NFTMetadata> {
		throw new Error("Method not implemented.");
	}
	getAccount(who: Address): Promise<Account> {
		throw new Error("Method not implemented.");
	}
	attest(): Promise<AttestationResult> {
		throw new Error("Method not implemented.");
	}
}
