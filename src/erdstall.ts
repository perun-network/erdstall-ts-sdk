// SPDX-License-Identifier: Apache-2.0
"use strict";

// This file contains the Erdstall implementation, unifying the on-chain and
// offchain part of Erdstall into a single interface.

import { Signer } from "ethers";
import { ethers } from "ethers";

import { TxReceipt } from "#erdstall/api/responses";
import { BalanceProof } from "#erdstall/api/responses";
import { Address, ErdstallEvent } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import { Stages } from "#erdstall/utils";
import Client from "#erdstall/client";
import { Enclave, EnclaveWSProvider, EnclaveEvent } from "#erdstall/enclave";

interface watcher<T extends ErdstallEvent | EnclaveEvent> {
	on: (ev: T, cb: Function) => void;
	once: (ev: T, cb: Function) => void;
	off: (ev: T, cb: Function) => void;
}

export interface ErdstallWatcher extends watcher<ErdstallEvent> {}

export interface EnclaveWatcher extends watcher<EnclaveEvent> {}

export interface Watcher extends watcher<ErdstallEvent | EnclaveEvent> {}

export interface Transactor {
	transferTo(assets: Assets, to: Address): Promise<TxReceipt>;
}

export interface Minter {
	mint: (token: Address, id: Uint256) => Promise<TxReceipt>;
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

export interface Subscriber {
	subscribe(): Promise<void>;
	onboard(): Promise<void>;
}

export interface Erdstall
	extends Watcher,
		Transactor,
		Minter,
		Depositor,
		Withdrawer,
		Exiter,
		Subscriber,
		Leaver {
	readonly address: Address;
	initialize(): Promise<void>;
}

export function NewClient(
	address: Address,
	signer: Signer,
	operatorAddress: URL,
): Erdstall {
	return new Client(
		address,
		signer,
		new Enclave(new EnclaveWSProvider(operatorAddress)),
	);
}
