// SPDX-License-Identifier: Apache-2.0
"use strict";

// This file contains the Erdstall implementation, unifying the on-chain and
// offchain part of Erdstall into a single interface.

import { ethers } from "ethers";

import { TxReceipt } from "#erdstall/api/responses";
import { TradeOffer } from "#erdstall/api/transactions";
import { BalanceProof } from "#erdstall/api/responses";
import { Address, Account, LedgerEvent } from "#erdstall/ledger";
import { TokenProvider } from "#erdstall/ledger/backend";
import { Assets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import { Stages } from "#erdstall/utils";
import { EnclaveEvent } from "#erdstall/enclave";
import { NFTMetadataProvider } from "#erdstall/ledger/backend";
import { OnChainQuerier } from "./ledger";

import { ErdstallEvent, ErdstallEventHandler } from "./event";
export * from "./client";
export * from "./session";

interface watcher<T extends ErdstallEvent> {
	on: <EV extends T>(ev: EV, cb: ErdstallEventHandler<EV>) => void;
	once: <EV extends T>(ev: EV, cb: ErdstallEventHandler<EV>) => void;
	off: <EV extends T>(ev: EV, cb: ErdstallEventHandler<EV>) => void;
}

export interface ErdstallWatcher extends watcher<LedgerEvent> {}

export interface EnclaveWatcher extends watcher<EnclaveEvent>, Subscriber {}

export interface Watcher extends watcher<ErdstallEvent> {}

export interface Contracter {
	erdstall(): Address;
}

export interface Transactor {
	transferTo(assets: Assets, to: Address): Promise<TxReceipt>;
}

export interface Minter {
	mint(token: Address, id: Uint256): Promise<TxReceipt>;
}

export interface Burner {
	burn(assets: Assets): Promise<TxReceipt>;
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
	subscribe(who?: Address): Promise<void>;
}

export interface OwnAccountGetter {
	getOwnAccount(): Promise<Account>;
}

export interface AccountGetter {
	getAccount(who: Address): Promise<Account>;
}

export interface Onboarder {
	onboard(): Promise<void>;
}

export interface Initializer {
	// This function has to be called before any subscribe calls can be made.
	// However, the Watcher calls should be made before this function is called,
	// if appropriate, to prevent events being missed.
	initialize(): Promise<void>;
}

export interface ErdstallClient
	extends Watcher,
		Contracter,
		Initializer,
		Subscriber,
		NFTMetadataProvider,
		AccountGetter {
	readonly tokenProvider: TokenProvider;
	readonly onChainQuerier: OnChainQuerier;
}

export interface ErdstallSession
	extends ErdstallClient,
		SelfSubscriber,
		OwnAccountGetter,
		Initializer,
		Transactor,
		Minter,
		Burner,
		Trader,
		Depositor,
		Withdrawer,
		Exiter,
		Leaver {
	readonly address: Address;
}
