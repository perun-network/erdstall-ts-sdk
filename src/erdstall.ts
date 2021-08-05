// SPDX-License-Identifier: Apache-2.0
"use strict";

// This file contains the Erdstall implementation, unifying the on-chain and
// offchain part of Erdstall into a single interface.

import { ethers } from "ethers";

import { TxReceipt } from "#erdstall/api/responses";
import { TradeOffer } from "#erdstall/api/transactions";
import { BalanceProof } from "#erdstall/api/responses";
import { Address, ErdstallEvent } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import { Stages } from "#erdstall/utils";
import { EnclaveEvent } from "#erdstall/enclave";

export * from "./client";
export * from "./session";

interface watcher<T extends ErdstallEvent | EnclaveEvent> {
	on: (ev: T, cb: Function) => void;
	once: (ev: T, cb: Function) => void;
	off: (ev: T, cb: Function) => void;
}

export interface ErdstallWatcher extends watcher<ErdstallEvent> {}

export interface EnclaveWatcher extends watcher<EnclaveEvent>, Subscriber {}

export interface Watcher extends watcher<ErdstallEvent | EnclaveEvent> {}

export interface Transactor {
	transferTo(assets: Assets, to: Address): Promise<TxReceipt>;
}

export interface Minter {
	mint: (token: Address, id: Uint256) => Promise<TxReceipt>;
}

export interface Trader {
	createOffer(offer: Assets, expect: Assets): Promise<TradeOffer>;
	acceptTrade(offer: TradeOffer): Promise<TxReceipt>;
}

export interface Depositor {
	deposit(
		assets: Assets,
	): Promise<Stages<Promise<ethers.ContractTransaction>>>;
}

export interface Withdrawer {
	withdraw(
		exitProof: BalanceProof,
	): Promise<Stages<Promise<ethers.ContractTransaction>>>;
}

export interface Exiter {
	exit(): Promise<BalanceProof>;
}

export interface Leaver extends Exiter, Withdrawer {
	leave(): Promise<Stages<Promise<ethers.ContractTransaction>>>;
}

export interface SelfSubscriber {
	subscribeSelf(): Promise<void>;
}

export interface Subscriber {
	subscribe(who?: Address):Promise<void>;
}

export interface Onboarder {
	onboard(): Promise<void>;
}

export interface ErdstallClient
	extends Watcher,
		Subscriber {
	// This function has to be called before any subscribe calls can be made.
	// However, the Watcher calls should be made before this function is called,
	// if appropriate, to prevent events being missed.
	initialize(): Promise<void>;
}

export interface ErdstallSession
	extends ErdstallClient,
		SelfSubscriber,
		Transactor,
		Minter,
		Trader,
		Depositor,
		Withdrawer,
		Exiter,
		Leaver {
	readonly address: Address;
	// This function has to be called before any enclave or ledger calls can be
	// made. However, the Watcher calls should be made before this function is
	// called, if appropriate, to prevent events being missed.
	initialize(): Promise<void>;
}