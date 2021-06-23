// SPDX-License-Identifier: Apache-2.0
"use strict";

// This file contains the Erdstall implementation, unifying the on-chain and
// offchain part of Erdstall into a single interface.

import { providers } from "ethers";
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

export interface ErdstallWatcher {
	on: (ev: ErdstallEvent, cb: Function) => void;
	once: (ev: ErdstallEvent, cb: Function) => void;
	off: (ev: ErdstallEvent, cb: Function) => void;
}

export interface EnclaveWatcher {
	on: (ev: EnclaveEvent, cb: Function) => void;
	once: (ev: EnclaveEvent, cb: Function) => void;
	off: (ev: EnclaveEvent, cb: Function) => void;
}

export interface Watcher {
	on: (ev: EnclaveEvent | ErdstallEvent, cb: Function) => void;
	once: (ev: EnclaveEvent | ErdstallEvent, cb: Function) => void;
	off: (ev: EnclaveEvent | ErdstallEvent, cb: Function) => void;
}

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
	provider: providers.Web3Provider,
	operatorAddress: URL,
): Erdstall {
	return new Client(
		address,
		provider,
		new Enclave(new EnclaveWSProvider(operatorAddress)),
	);
}
