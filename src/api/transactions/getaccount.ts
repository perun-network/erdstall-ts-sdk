// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Transaction,
	_transactionDecoders,
	TransactionType,
	TransactionOutput,
	TxCore,
} from "../transactions";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { SubstrateAddress } from "#erdstall/crypto/substrate";
import { ChainAssets } from "#erdstall/ledger/assets";
import {
	WildcardAddress,
	AESGCMKey,
	DHPair,
	DHPK,
} from "#erdstall/crypto/wildcard";
import { CodecReader, CodecWriter } from "#erdstall/utils";
import { SignedMessage } from "#erdstall/crypto";

const balance_fetch_modes = ["only_if_plaintext", "always"] as const;

export class GetAccount extends Transaction {
	constructor(
		core: TxCore,
		// fetches the encrypted secret key via DH exchange. If so, the response of the transaction is in plaintext.
		// TODO: Terrible name, this is diffie-hellman, not an aes key.
		public aes_secret: DHPair | undefined,
		// whether to fetch the balances, and whether to send them in plaintext. If in plaintext, or the secret key is requested, the response of the transaction is in plaintext.
		balances: (typeof balance_fetch_modes)[number] | boolean | undefined,
	) {
		super(core);
		if (typeof balances === "boolean")
			balances = balances ? "always" : undefined;
		this.balances = balances;
	}
	public balances: (typeof balance_fetch_modes)[number] | undefined;

	override transactionType() {
		return TransactionType.GetAccount;
	}

	override encode_impl(w: CodecWriter): void {
		w.opt_with(this.aes_secret, (v) => v.encode_pk(w));
		// TODO: Why the hell would this be an Option<bool> and be encoded in 1-2 bytes?
		w.opt_with(this.balances, (v) => w.u8(balance_fetch_modes.indexOf(v)));
	}
	static decode_impl(r: CodecReader, core: TxCore): GetAccount {
		return new GetAccount(
			core,
			r.opt(() => {
				throw new Error("Cannot decode a DH pair");
			}),
			r.opt(() => {
				let mode = balance_fetch_modes[r.u8()];
				if (mode === undefined)
					throw new Error(`Unknown balance fetch mode ${mode}`);
				return mode;
			}),
		);
	}

	// The output is already decrypted, if it was previously encrypted. But if it wasn't, it might still contain encrypted sections (balances).
	decode_output(o: TransactionOutput): GetAccount_Output {
		return GetAccount_Output.decode(new CodecReader(o.payload));
	}

	async decrypt_output(o: GetAccount_Output): Promise<{
		sk?: AESGCMKey;
		balances?: ChainAssets;
	}> {
		let sk: AESGCMKey | undefined;
		let balances: ChainAssets | undefined;
		if (o.aes_secret && this.aes_secret) {
			sk = await this.aes_secret.deriveSharedKey(o.aes_secret.tempDH);
		}
		if (o.balances) {
			// Are the balanecs in plain text?
			if (!o.balances.signature) {
				balances = ChainAssets.decode(new CodecReader(o.balances.message));
			} else {
				let decoded = await sk?.verifySig(o.balances);
				if (decoded !== undefined)
					balances = ChainAssets.decode(new CodecReader(decoded));
			}
		}
		return { sk, balances };
	}
}
_transactionDecoders.set(TransactionType.GetAccount, GetAccount.decode_impl);

export class GetAccount_Output {
	constructor(
		public nonce: bigint,
		public id: WildcardAddress | undefined,
		public eth: EthereumAddress | undefined,
		public subst: SubstrateAddress | undefined,
		public aes_secret:
			| { tempDH: DHPK; enc: SignedMessage<AESGCMKey> }
			| undefined,
		// using SignedMessage for encryption here.
		public balances: SignedMessage<ChainAssets> | undefined,
	) { }

	static decode(r: CodecReader): GetAccount_Output {
		return new GetAccount_Output(
			r.u64(),
			r.opt(WildcardAddress.decode_impl),
			r.opt(EthereumAddress.decode_impl),
			r.opt(SubstrateAddress.decode_impl),
			r.opt(() => ({
				tempDH: DHPK.decode(r),
				enc: SignedMessage.decode<AESGCMKey>(r),
			})),
			r.opt(SignedMessage.decode<ChainAssets>),
		);
	}

	encode(w: CodecWriter): void {
		w.u64(this.nonce);
		w.opt_with(this.id, (v) => v.encode_impl(w));
		w.opt_with(this.eth, (v) => v.encode_impl(w));
		w.opt_with(this.subst, (v) => v.encode_impl(w));
		w.opt_with(this.aes_secret, (v) => {
			v.tempDH.encode(w);
			v.enc.encode(w);
		});
		w.opt(this.balances);
	}
}
