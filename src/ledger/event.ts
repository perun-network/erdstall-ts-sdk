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

export type LedgerEvent = typeof event[number];

export function isLedgerEvent(v: any): v is LedgerEvent {
	return event.includes(v);
}

export interface Deposited {
	epoch: bigint;
	address: Address;
	assets: Assets;
}

export interface TokenRegistered {
	token: Address;
	tokenType: TokenType;
	tokenHolder: Address;
}

export interface TokenTypeRegistered {
	tokenType: TokenType;
	tokenHolder: Address;
}

export interface Frozen {
	epoch: bigint;
}

export interface OwnershipTransferrerd {
	previousOwner: Address;
	newOwner: Address;
}

export interface WithdrawalException {
	epoch: bigint;
	address: Address;
	token: Address;
	value: Assets;
	error: string;
}

export interface Withdrawn {
	epoch: bigint;
	address: Address;
	tokens: Assets;
}

export interface Challenged {
	epoch: bigint;
	address: Address;
}

export interface ChallengeResponded {
	epoch: bigint;
	address: Address;
	tokens: Assets;
	sig: Signature;
}
