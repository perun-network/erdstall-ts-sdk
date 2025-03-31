"use strict";

import { parseHex } from "#erdstall/utils/hexbytes"

import {
	PreparedTransactionRequest,
	TransactionResponse,
	Provider
} from "ethers";

import {
	UnsignedTx,
	SignedTx,
	TxReceipt,
	WildcardTx,
	TxSigner,
	TxSender
} from "#erdstall/ledger/backend";

import { EthereumSigner, EthereumAddress } from "#erdstall/crypto/ethereum";
import { Chain } from "#erdstall/ledger";


export class EthTxSigner extends TxSigner {
	#signer: EthereumSigner;
	#provider: Provider;

	override get address(): EthereumAddress { return this.#signer.address(); }

	constructor(chain: Chain, signer: EthereumSigner, provider: Provider) {
		super(
			chain,
			async () => BigInt(
				await signer.voidSigner(this.#provider).getNonce("pending"))
		);

		this.#signer = signer;
		this.#provider = provider;
	}

	async signTransaction(
		tx: PreparedTransactionRequest,
		session: any,
		chain: Chain): Promise<string>
	{
		this.require(session, chain);

		console.log("incNonce()");
		tx.nonce = Number(await this.incNonce(session, chain));
		console.log("address");
		tx.from = this.#signer.address().toString();

		console.log("ethers.signTransaction");
		return await this.#signer.signTransaction(tx);
	}
}

export class UnsignedEthTransaction extends UnsignedTx {
	#raw: PreparedTransactionRequest;

	override get native(): PreparedTransactionRequest
		{ return Object.assign({}, this.#raw); }

	constructor(
		desc: WildcardTx,
		raw: PreparedTransactionRequest)
	{
		super(desc);
		this.#raw = Object.assign({}, raw);
	}

	override async sign(s: TxSigner, session: any): Promise<SignedTx>
	{
		if(!s) throw new Error("no signer!");
		if(!(s instanceof EthTxSigner))
			throw new Error("Not an ethereum TX signer");

		const tx = this.native; // clone
		tx.from = s.address.toString();
		return new SignedEthTransaction(
			this.description,
			tx,
			await s.signTransaction(tx, session, this.chain));
	}
}

export class EthTxSender extends TxSender {
	#provider: Provider;

	constructor(chain: Chain, provider: Provider)
	{
		super(chain);
		this.#provider = provider;
	}

	async send(tx: string): Promise<TransactionResponse>
	{
		console.log("provider.broadcastTransaction");
		return await this.#provider.broadcastTransaction(tx);
	}
}

export class SignedEthTransaction extends SignedTx {
	#native: PreparedTransactionRequest;
	#signedTx: string;

	constructor(
		desc: WildcardTx,
		native: PreparedTransactionRequest,
		signed: string)
	{
		super(desc);
		this.#native = native;
		this.#signedTx = signed;
	}

	override get sender(): EthereumAddress
	{
		console.log(this.#native);
		return EthereumAddress.fromString(this.#native.from! as string);
	}

	override get native() { return Object.assign({}, this.#native); }
	override get nonce(): bigint { return BigInt(this.#native.nonce!); }

	override unsign(): UnsignedEthTransaction
		{ return new UnsignedEthTransaction(this.description, this.#native); }

	override async send(sender: TxSender): Promise<TxReceipt>
	{
		if(!(sender instanceof EthTxSender))
			throw new Error("not an ethereum TX sender");

		let response = await sender.send(this.#signedTx);
		// wait 15 minutes at most.
		let receipt = response.wait(1, 15 * 60 * 1000);

		const hash = parseHex(response.hash, "0x");

		return {
			tx: this,
			success: (async(): Promise<boolean> => {
				let r = await receipt;
				return r!.status === 1;
			})(),
			nativePending: response,
			hash,
		};
	}
}