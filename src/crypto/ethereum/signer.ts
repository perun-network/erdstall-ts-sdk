// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Signer as EthersSigner,
	Provider,
	VoidSigner,
	Wallet,
	BaseWallet,
	TransactionRequest,
	ethers
} from "ethers";
import { Signer, Address, Signature, Crypto } from "#erdstall/crypto";
import { EthereumSignature } from "./signature";
import { EthereumAddress } from "./address";
import { EthTxSigner } from "#erdstall/ledger/backend/ethereum/transaction";
import { Chain } from "#erdstall/ledger";

export abstract class EthereumSigner extends Signer<"ethereum">
{
	#address: EthereumAddress;

	// For populating a transaction without signing.
	voidSigner(p?: Provider): VoidSigner
		{ return new VoidSigner(this.#address.toString(), p); }

	address(): EthereumAddress { return this.#address; }

	constructor(address: EthereumAddress) {
		super();
		this.#address = address;
	}

	override type(): "ethereum" { return "ethereum"; }

	static async fromEthersSigner(s: EthersSigner): Promise<EthereumSigner>
	{
		return new EthereumEthersSigner(
			s,
			EthereumAddress.fromString(await s.getAddress()));
	}


	// TODO: make sure this does not allow us to sign L1 transactions.
	abstract sign(message: Uint8Array): Promise<EthereumSignature>;
	// NOTE IMPROVE SECURITY: might want to move that to a #private function that gets passed to EthTxSigner instead.
	abstract signTransaction(tx: TransactionRequest): Promise<string>;

	toTxSigner(chain: Chain, p: Provider): EthTxSigner
		{ return new EthTxSigner(chain, this, p); }

	// Generates a unique random custodial account. Returns a signer, its
	// associated account's address, and the private key used for restoring
	// that account later using `restoreCustodialAccount()`.
	static generateCustodialAccount(): {
		signer: EthereumSigner;
		privateKey: string;
	} {
		let wallet = ethers.Wallet.createRandom();
		return {
			signer: new EthereumCustodialSigner(wallet),
			privateKey: wallet.privateKey,
		};
	}

	// Restores a custodial account from its private key, as returned by
	// `generateCustodialAccount()`. Returns a signer and the associated
	// account's address.
	static restoreCustodialAccount(privateKey: string): EthereumSigner
	{
		let wallet = new ethers.Wallet(privateKey);
		return new EthereumCustodialSigner(wallet);
	}
}

export class EthereumCustodialSigner extends EthereumSigner {
	#wallet: BaseWallet;

	constructor(wallet: BaseWallet)
	{
		super(EthereumAddress.fromString(wallet.address));
		this.#wallet = wallet;
	}

	override async sign(message: Uint8Array): Promise<EthereumSignature>
	{
		const sig = await this.#wallet.signMessage(
			ethers.getBytes(ethers.keccak256(message)));
		return new EthereumSignature(ethers.getBytes(sig));
	}

	override async signTransaction(tx: TransactionRequest): Promise<string>
		{ return await this.#wallet.signTransaction(tx); }
}

export class EthereumEthersSigner extends EthereumSigner {
	#ethersSigner: EthersSigner;

	constructor(signer: EthersSigner, address: EthereumAddress)
	{
		super(address);
		this.#ethersSigner = signer;
	}

	override async sign(message: Uint8Array): Promise<EthereumSignature>
	{
		const sig = await this.#ethersSigner.signMessage(
			ethers.getBytes(ethers.keccak256(message)));
		return new EthereumSignature(ethers.getBytes(sig));
	}

	override async signTransaction(tx: TransactionRequest): Promise<string>
		{ return await this.#ethersSigner.signTransaction(tx); }
}

/* TODO: Injected signers are not so simple to use properly:
	- Signer needs to handle disconnects, (re-)connection prompts, and ensuring the injected signer has the right active account and chain.
	- We want to have a proper utility for querying various injected wallets, and letting the user choose them. */
//export class EthereumInjectedSigner extends EthereumSigner { }