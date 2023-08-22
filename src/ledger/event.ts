// LedgerEvent describes all on-chain events related to Erdstall, which are emitted
// by the ledger backends.
"use strict";

import { Signature } from "#erdstall/api";
import { Address } from "./address";
import { Assets, TokenType } from "./assets";
import { Backend } from "#erdstall/ledger/backend";

const event = [
	"Frozen",
	"Deposited",
	"Withdrawn",
	"Challenged",
	"ChallengeResponded",
	"TokenTypeRegistered",
	"TokenRegistered",
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
	address: Address;
	assets: Assets;
}

/**
 * TokenRegistered event struct emitted by the Erdstall contract.
 */
export interface TokenRegistered<Bs extends Backend[][number]> {
	source: Bs;
	token: Address;
	tokenType: TokenType;
	tokenHolder: Address;
}

/**
 * TokenTypeRegistered event struct emitted by the Erdstall contract.
 */
export interface TokenTypeRegistered<Bs extends Backend[][number]> {
	source: Bs;
	tokenType: TokenType;
	tokenHolder: Address;
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
	previousOwner: Address;
	newOwner: Address;
}

/**
 * WithdrawalException event struct emitted by the Erdstall contract.
 */
export interface WithdrawalException<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: Address;
	token: Address;
	value: Assets;
	error: string;
}

/**
 * Withdrawn event struct emitted by the Erdstall contract.
 */
export interface Withdrawn<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: Address;
	tokens: Assets;
}

/**
 * Challenged event struct emitted by the Erdstall contract.
 */
export interface Challenged<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: Address;
}

/**
 * ChallengeResponded event struct emitted by the Erdstall contract.
 */
export interface ChallengeResponded<Bs extends Backend[][number]> {
	source: Bs;
	epoch: bigint;
	address: Address;
	tokens: Assets;
	sig: Signature;
}
