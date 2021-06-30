// SPDX-License-Identifier: Apache-2.0
"use strict";

// This file contains the Erdstall implementation, unifying the on-chain and
// offchain part of Erdstall into a single interface.

import { Signer } from "ethers";
import { ethers } from "ethers";

import { TxReceipt } from "./api/responses/txreceipt";
import { BalanceProof } from "./api/responses/balanceproof";
import { Assets } from "./ledger";
import { Address } from "./ledger";
import { Uint256 } from "./api/util";
import ErdstallEvent from "./ledger/event";
import EnclaveEvent from "./enclave/event";
import Client from "./client";
import { Enclave, EnclaveWSProvider } from "./enclave";

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
	mint: (owner: Address, token: Address, id: Uint256) => Promise<TxReceipt>;
}

export interface Depositor {
	deposit(assets: Assets): Promise<ethers.ContractTransaction[]>;
}

export interface Withdrawer {
	withdraw(exitProof: BalanceProof): Promise<ethers.ContractTransaction[]>;
}

export interface Exiter {
	exit(): Promise<BalanceProof>;
}

export interface Leaver extends Exiter, Withdrawer {
	leave(): Promise<ethers.ContractTransaction[]>;
}

export interface Erdstall
	extends Watcher,
		Transactor,
		Minter,
		Depositor,
		Withdrawer,
		Exiter,
		Leaver {
	initialise(): void;
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
