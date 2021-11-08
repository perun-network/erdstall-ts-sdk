// LedgerEvent describes all on-chain events related to Erdstall, which are emitted
// by the ledger backends.
"use strict";

import { Signature } from "#erdstall/api";
import { Address } from "./address";
import { Assets, TokenType } from "./assets";

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
export type LedgerEvent = typeof event[number];

export function isLedgerEvent(v: any): v is LedgerEvent {
	return event.includes(v);
}

/**
 * Deposited event struct emitted by the Erdstall contract.
 */
export interface Deposited {
	epoch: bigint;
	address: Address;
	assets: Assets;
}

/**
 * TokenRegistered event struct emitted by the Erdstall contract.
 */
export interface TokenRegistered {
	token: Address;
	tokenType: TokenType;
	tokenHolder: Address;
}

/**
 * TokenTypeRegistered event struct emitted by the Erdstall contract.
 */
export interface TokenTypeRegistered {
	tokenType: TokenType;
	tokenHolder: Address;
}

/**
 * Frozen event struct emitted by the Erdstall contract.
 */
export interface Frozen {
	epoch: bigint;
}

/**
 * OwnershipTransferrerd event struct emitted by the Erdstall contract.
 */
export interface OwnershipTransferrerd {
	previousOwner: Address;
	newOwner: Address;
}

/**
 * WithdrawalException event struct emitted by the Erdstall contract.
 */
export interface WithdrawalException {
	epoch: bigint;
	address: Address;
	token: Address;
	value: Assets;
	error: string;
}

/**
 * Withdrawn event struct emitted by the Erdstall contract.
 */
export interface Withdrawn {
	epoch: bigint;
	address: Address;
	tokens: Assets;
}

/**
 * Challenged event struct emitted by the Erdstall contract.
 */
export interface Challenged {
	epoch: bigint;
	address: Address;
}

/**
 * ChallengeResponded event struct emitted by the Erdstall contract.
 */
export interface ChallengeResponded {
	epoch: bigint;
	address: Address;
	tokens: Assets;
	sig: Signature;
}
