// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer, Address } from "#erdstall/crypto";
import { ChainAssets } from "#erdstall/ledger/assets";

import { ChainProofChunk } from "#erdstall/api/responses";

import { EventEmitter } from "#erdstall/event";

import {Chain, getChainName} from "#erdstall/ledger";

/*  Wildcard L1 transactions and receipt types.
	This file defines the user-level API for interacting with transactions.
	Design goals:
	- blockchain-agnostic
	- intuitive, easy to use by business logic code:
		- easy flow
		- good error reporting
	- easy to display in chain-agnostic and chain-specific frontends:
		- expose important information uniformly
		- good error handling capabilities
		- progress reports
		- link to chain explorers for transparency

	Besides the Session object, this is one of the most important interfaces the SDK offers, so we should design this as best we can.

	Problems that cropped up:
		- Dealing with the fact that withdraw transactions get sent way after they get signed, causing issues with nonce tracking / concurrency if we want another transaction to precede it. */


// Exposes an awaitable L1 TX receipt for a TX that has been signed and sent.
export interface TxReceipt {
	tx: SignedTx;
	success: Promise<boolean>; // whether the tx succeeded or reverted/failed.
	nativePending: any; // The native pending tx receipt before block inclusion.
	hash: Uint8Array;
	link?: URL;
}



export abstract class WildcardTx {
	#chain: Chain;
	get chain(): Chain { return this.#chain; }

	constructor(chain: Chain) { this.#chain = chain; }

	abstract name(): string;

	// Clone for security: we want immutable value semantics on our transactions. We want to be especially careful here as this is an easy attack vector that can be used to fool users into sending fraudulent transactions.
	abstract clone(): this;

	abstract toJSONTable(): Record<string, any>;
}

export class ApproveTx extends WildcardTx {
	destination: Address;
	amount: ChainAssets;

	constructor(chain: Chain, destination: Address, amount: ChainAssets)
	{
		super(chain);
		this.destination = destination.clone();
		this.amount = amount.clone();
	}

	override clone(): this {
		return new ApproveTx(
			this.chain,
			this.destination,
			this.amount) as this;
	}

	override name(): string { return "Approve"; }

	override toJSONTable(): Record<string, any>
	{
		return {
			chain: getChainName(this.chain),
			destination: this.destination.toString(),
			amount: ChainAssets.toJSON(this.amount)
		};
	}
}

export class DepositTx extends WildcardTx {
	amount: ChainAssets;

	constructor(chain: Chain, amount: ChainAssets) {
		super(chain);
		this.amount = amount.clone();
	}

	override clone(): this
		{ return new DepositTx(this.chain, this.amount) as this; }

	override name(): string { return "Deposit"; }

	override toJSONTable(): Record<string, any>
	{
		return {
			chain: getChainName(this.chain),
			amount: ChainAssets.toJSON(this.amount)
		};
	}
}

export class WithdrawTx extends WildcardTx {
	proofChunk: ChainProofChunk;
	chunkIndex: number;
	chunkCount: number;
	epoch: bigint;
	account: Address;

	constructor(args: {
		chain: Chain,
		proofChunk: ChainProofChunk,
		chunkIndex: number,
		chunkCount: number,
		epoch: bigint,
		account: Address
	}) {
		super(args.chain);
		this.proofChunk = args.proofChunk.clone();
		this.chunkIndex = args.chunkIndex;
		this.chunkCount = args.chunkCount;
		this.epoch = args.epoch;
		this.account = args.account.clone();
	}

	override clone(): this {
		return new WithdrawTx({
			chain: this.chain,
			proofChunk: this.proofChunk,
			chunkIndex: this.chunkIndex,
			chunkCount: this.chunkCount,
			epoch: this.epoch,
			account: this.account
		}) as this;
	}

	name(): string { return "Withdraw"; }

	override toJSONTable(): Record<string, any>
	{
		return {
			chain: getChainName(this.chain),
			account: this.account.toString(),
			id: `${this.chunkIndex}/${this.chunkCount}`,
			amount: ChainAssets.toJSON(this.proofChunk.funds),
			proof: this.proofChunk.sig.toString()
		};
	}
}

export abstract class UnsignedTx {
	#tx: WildcardTx;

	get chain(): Chain { return this.#tx.chain; }

	get description(): WildcardTx { return this.#tx.clone(); }
	abstract get native(): any;


	constructor(tx: WildcardTx) { this.#tx = tx.clone(); }

	abstract sign(signer: TxSigner, session: any): Promise<SignedTx>;

	async sign_and_send(signer: TxSigner, sender: TxSender): Promise<TxReceipt> {
		let signed = await signer.signing_session(
			async (s: any) => await this.sign(signer, s));
		return signed.send(sender);
	}
}

export abstract class SignedTx {
	#tx: WildcardTx;

	constructor(tx: WildcardTx) { this.#tx = tx.clone(); }

	get chain(): Chain { return this.#tx.chain; }
	get description(): WildcardTx { return this.#tx.clone(); }

	abstract get native(): any;

	abstract get sender(): Address;
	abstract get nonce(): bigint;

	abstract unsign(): UnsignedTx;

	abstract send(s: TxSender): Promise<TxReceipt>;
}

export class TxReceipt {}

// Mutex type helping us to properly secure resources.
class Mutex {
	#session?: Promise<void>;
	#unlock?: () => void;
	#sessionId?: any;

	get locked(): boolean { return this.#session !== undefined; }

	owned(session: any): boolean
		{ return this.locked && Object.is(session, this.#sessionId); }

	async lock(): Promise<any> {
		do { await this.#session; } while(this.#session !== undefined);

		this.#session = new Promise<void>(accept => this.#unlock = accept);
		return this.#sessionId = {};
	}

	unlock(session: any): void
	{
		if(!this.session) throw new Error("Mutex is not currently locked");
		if(!this.owned(session))
			throw new Error("Mutex unlock attempted with invalid session id");

		const unlock = this.#unlock!;
		this.#unlock = undefined;
		this.#session = undefined;
		unlock();
	}

	async session<T>(
		the_thing: (sessionId: any) => Promise<T>
	): Promise<T> {
		let id = await this.lock();

		try { return await the_thing(id); }
		finally { this.unlock(id); }
	}
}

/* The goal of this signer is to have a robust, UI-friendly L1 transaction signer that lets us sign batches of transactions.
- Why is this so complex?
	Because we have the special case of having to wait potentially for a long time before some transactions can be sent (withdrawals). We do not want to make users wait until the point where the transaction becomes valid to send, instead, we want to minimise waiting times and sign the transactions ahead of time, and then send them once they become valid. However, the big problem then is that we signed the transactions with future nonces, and we want to make sure that the nonces are not invalidated by other actions (such as deposits) that happen before. So, we want a mechanism that lets us deal with that gracefully.
- How does this signer work?
	We enter a signing session, which is a mutex lock that gives us exclusive ownership of the nonces, and lets us sign a batch of transactions with future nonces. If we want to perform an immediate transaction while other transactions are queued up, we can discard the queued transactions and sign new ones. The old transactions get invalidated by this, and have to get re-signed. */
export abstract class TxSigner {
	#nonce?: bigint;
	readonly #signing = new Mutex;
	#resetHandlers = new EventEmitter<bigint>();
	#chain: Chain;

	abstract get address(): Address;

	#getPendingNonce: () => Promise<bigint>;

	constructor(
		chain: Chain,
		getPendingNonce: () => Promise<bigint>)
	{
		this.#chain = chain;
		this.#getPendingNonce = getPendingNonce;
	}

	protected require(id: any, chain: Chain): void
	{
		if(!this.#signing.owned(id))
			throw new Error(`Logic error: operation only valid in a signing session.`);

		if(this.#chain !== chain)
			throw new Error(`Logic error: attempted to use TxSigner for ${getChainName(this.#chain)} on transaction for ${getChainName(chain)}.`);
	}

	// Use this to fetch a nonce for chaining new transactions.
	async incNonce(sessId: any, chain: Chain): Promise<bigint>
	{
		this.require(sessId, chain);
		if(this.#nonce === undefined)
			this.#nonce = await this.#getPendingNonce();
		return this.#nonce++;
	}

	// Use this to reset to the last pending nonce.
	async resetNonce(session: any, chain: Chain): Promise<void> {
		this.require(session, chain);

		let hs = this.#resetHandlers;

		const is_init = (this.#nonce === undefined);
		this.#nonce = await this.#getPendingNonce();

		if(!is_init)
			this.#resetHandlers.emit(this.#nonce);
	}

	// TODO: is this good design? might be too general for our purposes.

	// Returns a handler which gets notified when the nonce gets reset.
	on_reset(handler: (nonce: bigint) => void): void
		{ this.#resetHandlers.on(handler); }
	// Clears a nonce reset handler, because the associated transactions are already sent.
	off_reset(handler: (nonce: bigint) => void): void
		{ this.#resetHandlers.off(handler); }


	async enterSigningSession(): Promise<any>
		{ return await this.#signing.lock(); }

	finishSigningSession(session: any): void { this.#signing.unlock(session); }

	async signing_session<T>(
		session_logic: (session: any) => Promise<T>
	): Promise<T>
	{
		return await this.#signing.session(session_logic);
	}
}

export abstract class TxSender {
	#chain: Chain;

	constructor(chain: Chain)
		{ this.#chain = chain; }

	require(chain: Chain): void
	{
		if(this.#chain !== chain)
			throw new Error(`Logic error: attempted to use TxSender for ${getChainName(this.#chain)} on transaction for ${getChainName(chain)}.`);
	}
}

// Non-empty batch of unsigned transactions for the same chain.
export class UnsignedTxBatch {
	#chain: Chain;
	get chain(): Chain { return this.#chain; }

	#txs: UnsignedTx[];

	get length(): number { return this.#txs.length; }
	at(i: number): UnsignedTx { return this.#txs[i]; }

	constructor(txs: UnsignedTx[])
	{
		if(!txs.length)
			throw new Error("Transaction batches cannot be empty.");
		this.#chain = txs[0].chain;
		for(let tx of txs)
		{
			if(tx.chain !== this.#chain)
				throw new Error("Tranaction batch contains transactions for multiple chains");
		}
		this.#txs = [...txs];
	}

	// TODO: watch for invalidation when the nonce gets reset when the signer signs another transaction and sends it before we send these (such as while awaiting finality of a withdraw)... For now, we could simply mark the signer as locked? Or force it to append the nonce and force them to be sent in order. But I guess it would be best to simply make the transaction unsendable if the signer signs something before we send it.
	async sign(s: TxSigner, on_invalidate: () => void): Promise<SignedTxBatch>
	{
		return await s.signing_session(async(session: any) => {
			let signed_txs: SignedTx[] = [];
			for(let tx of this.#txs)
				signed_txs.push(await tx.sign(s, session));

			const batch = new SignedTxBatch(signed_txs, on_invalidate);
			s.on_reset((nonce: bigint) => batch.invalidate(nonce));
			return batch;
		});
	}
}

// Non-empty batch of signed transactions for the same chain.
export class SignedTxBatch {
	#chain: Chain;
	get chain(): Chain { return this.#chain; }
	get sender(): Address { return this.#txs[0].sender; }
	get startnonce(): bigint { return this.#txs[0].nonce; }
	get length(): number { return this.#txs.length; }

	#txs: SignedTx[];

	invalidate(nonce: bigint): void {}

	constructor(txs: SignedTx[], on_invalidate: () => void)
	{
		this.#chain = txs[0].chain;
		let nonce = txs[0].nonce;
		let sender = txs[0].sender;
		for(let tx of txs)
		{
			if(tx.chain !== this.#chain)
				throw new Error("Signed tranaction batch contains transactions for multiple chains");
			if(tx.nonce !== nonce)
				throw new Error(`Non-consecutive nonces in batch.`);

			if(!tx.sender.equals(sender))
				throw new Error("Signed transaction batch contains transactions from multiple senders");
			++nonce;
		}

		this.#txs = [...txs];
	}

	async send(signer: TxSigner, sender: TxSender): Promise<TxReceiptBatch> {
		let receipts: Promise<TxReceipt>[] = [];

		return await signer.signing_session(async(s: any) => {
			for(let tx of this.#txs)
				receipts.push(tx.send(sender));
			let sent = await Promise.all(receipts);
			return new TxReceiptBatch(sent);
		});
	}
}

// Non-empty batch of transaction receipts for the same chain.
export class TxReceiptBatch {
	#chain: Chain;
	get chain(): Chain { return this.#chain; }

	#receipts: TxReceipt[];

	constructor(receipts: TxReceipt[])
	{
		if(!receipts.length)
			throw new Error("Receipt batches cannot be empty.");

		this.#chain = receipts[0].tx.chain;
		for(let receipt of receipts)
			if(receipt.tx.chain !== this.#chain)
				throw new Error("Receipt batch contains receipts for multiple chains");
		this.#receipts = [...receipts];
	}

	async awaitAll(): Promise<boolean> {
		return (await Promise.all(this.#receipts.map(r => r.success))).every(x => x);
	}
}