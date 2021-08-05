// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";

import { TxReceipt, BalanceProof } from "#erdstall/api/responses";
import { Transfer, Mint, ExitRequest, TradeOffer, Trade } from "#erdstall/api/transactions";
import { EnclaveWriter, Enclave } from "#erdstall/enclave";
import { Address, LedgerWriter } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import { Stages } from "#erdstall/utils";
import { ErdstallSession } from "./erdstall";
import { Client } from "./client";

export const ErrUnitialisedClient = new Error("client unitialised");

export class Session extends Client implements ErdstallSession {
	readonly address: Address;
	private nonce: bigint;
	private readonly enclaveWriter: EnclaveWriter;
	private readonly signer: Signer;

	constructor(address: Address, signer: Signer, enclave: EnclaveWriter | URL) {
		super(signer, enclave);
		this.enclaveWriter = this.enclaveConn as EnclaveWriter;
		this.signer = signer;
		this.address = address;
		this.nonce = 1n;
		this.enclaveWriter.on("error", () => { this.updateNonce(); });
	}

	private async nextNonce(): Promise<bigint> {
		if (this.nonce === 1n) {
			await this.updateNonce();
		}

		return this.nonce++;
	}

	private async updateNonce(): Promise<void> {
		const acc = await this.enclaveWriter.getAccount(this.address);
		this.nonce = acc.account.nonce.valueOf() + 1n;
	}

	async onboard(): Promise<void> {
		return this.enclaveWriter.onboard(this.address);
	}

	async subscribeSelf(): Promise<void> {
		return this.subscribe(this.address);
	}

	async transferTo(assets: Assets, to: Address): Promise<TxReceipt> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}
		const tx = new Transfer(
			this.address,
			await this.nextNonce(),
			to,
			assets,
		);
		await tx.sign(this.erdstallConn.erdstall(), this.signer);
		return this.enclaveWriter.transfer(tx);
	}

	async mint(token: Address, id: Uint256): Promise<TxReceipt> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		const minttx = new Mint(
			this.address,
			await this.nextNonce(),
			token,
			id,
		);
		await minttx.sign(this.erdstallConn.erdstall(), this.signer);
		return this.enclaveWriter.mint(minttx);
	}

	async deposit(
		assets: Assets,
	): Promise<Stages<Promise<ethers.ContractTransaction>>> {
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

	async withdraw(
		exitProof: BalanceProof,
	): Promise<Stages<Promise<ethers.ContractTransaction>>> {
		if (!this.erdstallConn) {
			return Promise.reject(ErrUnitialisedClient);
		}

		return (this.erdstallConn as LedgerWriter).withdraw(exitProof);
	}

	async leave(): Promise<Stages<Promise<ethers.ContractTransaction>>> {
		const exitProof = await this.exit();
		await new Promise(accept => this.once("phaseshift", accept));
		return this.withdraw(exitProof);
	}

	async createOffer(offer: Assets, expect: Assets): Promise<TradeOffer> {
		const o = new TradeOffer(this.address, offer, expect);
		return o.sign(this.erdstallConn!.erdstall(), this.signer);
	}

	async acceptTrade(offer: TradeOffer): Promise<TxReceipt> {
		const tx = new Trade(this.address, await this.nextNonce(), offer);
		await tx.sign(this.erdstallConn!.erdstall(), this.signer);
		return this.enclaveWriter.trade(tx);
	}
}
