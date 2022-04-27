// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signer } from "ethers";

import { BalanceProof } from "#erdstall/api/responses";
import {
	Transfer,
	Mint,
	ExitRequest,
	TradeOffer,
	Trade,
	Burn,
} from "#erdstall/api/transactions";
import { InternalEnclaveWatcher } from "./internalenclavewatcher";
import { EnclaveWriter } from "#erdstall/enclave";
import { Address, Account, LedgerWriter } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import { ErdstallSession } from "./erdstall";
import { ErdstallEventHandler } from "./event";
import { Client } from "./client";
import { TransactionGenerator } from "#erdstall/utils";
import { ReceiptDispatcher } from "./utils/receipt_dispatcher";
import { PendingTransaction } from "./api/util/pending_transaction";

export const ErrUnitialisedClient = new Error("client unitialised");

export class Session extends Client implements ErdstallSession {
	readonly address: Address;
	private nonce: bigint;
	private readonly enclaveWriter: EnclaveWriter & InternalEnclaveWatcher;
	private readonly signer: Signer;
	readonly receiptDispatcher: ReceiptDispatcher;

	constructor(
		address: Address,
		signer: Signer,
		enclave: (EnclaveWriter & InternalEnclaveWatcher) | URL,
	) {
		super(signer, enclave);
		this.enclaveWriter = this.enclaveConn as EnclaveWriter &
			InternalEnclaveWatcher;
		this.signer = signer;
		this.address = address;
		// Start with an invalid nonce, so that it will be queried anew
		// upon its next use.
		this.nonce = 0n;
		// When encountering any error, assume it might be a nonce mismatch. In
		// this case, reset the nonce to an invalid value.
		this.enclaveWriter.on("error", () => {
			this.nonce = 0n;
		});
		this.receiptDispatcher = new ReceiptDispatcher(this.erdstallConn);
		this.on_internal(
			"receipt",
			this.receiptDispatcher.watch.bind(this.receiptDispatcher),
		);
	}

	// Queries the next nonce and increases the counter. If the nonce has an
	// invalid value, queries the current nonce from the enclave. This function
	// can be called concurrently.
	private async nextNonce(): Promise<bigint> {
		if (!this.nonce) {
			await this.updateNonce();
		}

		return this.nonce++;
	}

	// Fetches the current nonce from the enclave. Only overwrites the nonce if
	// it has an invalid value, so this function can be called concurrently.
	private async updateNonce(): Promise<void> {
		const acc = await this.enclaveWriter.getAccount(this.address);
		if (!this.nonce) {
			this.nonce = acc.account.nonce + 1n;
		}
	}

	async onboard(): Promise<void> {
		return this.enclaveWriter.onboard(this.address);
	}

	async subscribeSelf(): Promise<void> {
		return this.subscribe(this.address);
	}

	async getOwnAccount(): Promise<Account> {
		return this.getAccount(this.address);
	}

	async transferTo(assets: Assets, to: Address): Promise<PendingTransaction> {
		if (!this.erdstallConn) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Transfer(this.address, nonce, to, assets);
		await tx.sign(this.erdstallConn!.erdstall(), this.signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.transfer(tx);
		return { receipt, accepted };
	}

	async mint(token: Address, id: Uint256): Promise<PendingTransaction> {
		if (!this.erdstallConn) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Mint(this.address, nonce, token, id);
		await tx.sign(this.erdstallConn!.erdstall(), this.signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.mint(tx);
		return { receipt, accepted };
	}

	async burn(assets: Assets): Promise<PendingTransaction> {
		if (!this.erdstallConn) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Burn(this.address, nonce, assets);
		await tx.sign(this.erdstallConn!.erdstall(), this.signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.burn(tx);
		return { receipt, accepted };
	}

	async deposit(assets: Assets): Promise<TransactionGenerator> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		return (this.erdstallConn as LedgerWriter).deposit(assets);
	}

	async exit(): Promise<BalanceProof> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		const exittx = new ExitRequest(this.address, await this.nextNonce());
		await exittx.sign(this.erdstallConn.erdstall(), this.signer);
		return this.enclaveWriter.exit(exittx);
	}

	async withdraw(exitProof: BalanceProof): Promise<TransactionGenerator> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		return (this.erdstallConn as LedgerWriter).withdraw(exitProof);
	}

	async leave(
		notify?: (message: string, stage: number, maxStages: number) => void,
	): Promise<TransactionGenerator> {
		let skipped = 0;
		let cb: ErdstallEventHandler<"phaseshift">;
		let atStage = 1;
		let maxStages = 3;
		const p = new Promise<void>((accept) => {
			cb = () => {
				// One Epoch when the current epoch ends for which we receive the ExitProof.
				// One more Epoch to guarantee that our ExitProof is part of a sealed epoch.
				if (skipped < 2) {
					skipped++;
				} else {
					accept();
				}
			};
			this.on_internal("phaseshift", cb);
		});
		notify?.("awaiting exit proof", atStage++, maxStages);
		const exitProof = await this.exit();
		notify?.("awaiting epoch sealing", atStage++, maxStages);
		await p.then(() => this.off_internal("phaseshift", cb));
		notify?.("withdrawing", atStage++, maxStages);
		return this.withdraw(exitProof);
	}

	async createOffer(offer: Assets, expect: Assets): Promise<TradeOffer> {
		const o = new TradeOffer(this.address, offer, expect);
		return o.sign(this.erdstallConn!.erdstall(), this.signer);
	}

	async acceptTrade(offer: TradeOffer): Promise<PendingTransaction> {
		if (!this.erdstallConn) {
			throw ErrUnitialisedClient;
		}
		const nonce = await this.nextNonce();
		const tx = new Trade(this.address, nonce, offer);
		await tx.sign(this.erdstallConn!.erdstall(), this.signer);
		const hash = tx.hash();
		const receipt = this.receiptDispatcher.register(hash);
		const accepted = this.enclaveWriter.trade(tx);
		return { receipt, accepted };
	}
}
