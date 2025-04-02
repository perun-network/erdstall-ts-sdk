// LedgerEvent describes all on-chain events related to Erdstall, which are emitted
// by the ledger backends.
"use strict";

import { ChainAssets } from "./assets";
import { Signature, Address } from "#erdstall/crypto";
import { Chain } from "#erdstall/ledger";

const event = [
	"Frozen",
	"Deposited",
	"Withdrawn",
	"Challenged",
	"ChallengeResponded",
] as const;

export abstract class LedgerEvent {
	constructor(
		public chain: Chain
	) {}
}

/**
 * Deposited event struct emitted by the Erdstall contract.
 */
export class Deposited extends LedgerEvent {
	constructor(
		chain: Chain,
		public epoch: bigint,
		public address: Address,
		public assets: ChainAssets
	) { super(chain); }
}

/**
 * Frozen event struct emitted by the Erdstall contract.
 */
export class Frozen extends LedgerEvent {
	constructor(
		chain: Chain,
		public epoch: bigint
	) { super(chain); }
}

/**
 * OwnershipTransferred event struct emitted by the Erdstall contract.
 */
export class OwnershipTransferred extends LedgerEvent {
	constructor(
		chain: Chain,
		public previousOwner: Address,
		public newOwner: Address
	) { super(chain); }
}

/**
 * WithdrawalException event struct emitted by the Erdstall contract.
 */
export class WithdrawalException extends LedgerEvent {
	constructor(
		chain: Chain,
		public epoch: bigint,
		public address: Address,
		public token: Address,
		public value: ChainAssets,
		public error: string
	) { super(chain); }
}

/**
 * Withdrawn event struct emitted by the Erdstall contract.
 */
export class Withdrawn extends LedgerEvent {
	constructor(
		chain: Chain,
		public epoch: bigint,
		public address: Address,
		public tokens: ChainAssets
	) { super(chain); }
}

/**
 * Challenged event struct emitted by the Erdstall contract.
 */
export class Challenged extends LedgerEvent {
	constructor(
		chain: Chain,
		public epoch: bigint,
		public address: Address
	) { super(chain); }
}

/**
 * ChallengeResponded event struct emitted by the Erdstall contract.
 */
export class ChallengeResponded extends LedgerEvent {
	constructor(
		chain: Chain,
		public epoch: bigint,
		public chunks: { index: number, count: number},
		public address: Address,
		public tokens: ChainAssets,
		public sig: Signature
	) { super(chain); }
}
