// LedgerEvent describes all on-chain events related to Erdstall, which are emitted
// by the ledger backends.
"use strict";

import { BackendAddress, BackendSignature } from "#erdstall/erdstall";
import { ChainAssets, TokenType } from "./assets";
import { Backend } from "#erdstall/ledger/backend";

const event = [
	"Frozen",
	"Deposited",
	"Withdrawn",
	"Challenged",
	"ChallengeResponded",
	"TokenTypeRegistered",
] as const;

/**
 * All event names which can be listened for and are emitted by the Erdstall
 * contract.
 */
export type LedgerEvent = (typeof event)[number];

export function isLedgerEvent(v: any): v is LedgerEvent {
	return event.includes(v);
}

/**
 * Deposited event struct emitted by the Erdstall contract.
 */
export interface Deposited<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: BackendAddress<Bs>;
	assets: ChainAssets;
}

/**
 * TokenTypeRegistered event struct emitted by the Erdstall contract.
 */
export interface TokenTypeRegistered<Bs extends Backend[][number]> {
	source: Bs;
	tokenType: TokenType;
	tokenHolder: BackendAddress<Bs>;
}

/**
 * Frozen event struct emitted by the Erdstall contract.
 */
export interface Frozen<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
}

/**
 * OwnershipTransferrerd event struct emitted by the Erdstall contract.
 */
export interface OwnershipTransferrerd<Bs extends Backend[][number]> {
	source: Bs;
	previousOwner: BackendAddress<Bs>;
	newOwner: BackendAddress<Bs>;
}

/**
 * WithdrawalException event struct emitted by the Erdstall contract.
 */
export interface WithdrawalException<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: BackendAddress<Bs>;
	token: BackendAddress<Bs>;
	value: ChainAssets;
	error: string;
}

/**
 * Withdrawn event struct emitted by the Erdstall contract.
 */
export interface Withdrawn<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: BackendAddress<Bs>;
	tokens: ChainAssets;
}

/**
 * Challenged event struct emitted by the Erdstall contract.
 */
export interface Challenged<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: BackendAddress<Bs>;
}

/**
 * ChallengeResponded event struct emitted by the Erdstall contract.
 */
export interface ChallengeResponded<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: BackendAddress<Bs>;
	tokens: ChainAssets;
	sig: BackendSignature<Bs>;
}
