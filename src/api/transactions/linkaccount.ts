// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Transaction,
	TransactionType,
	NonceCheck,
	_transactionDecoders,
	TxCore,
} from "./transaction";
import { Address, Signature, Signer } from "#erdstall/crypto";
import { WildcardAddress } from "#erdstall/crypto/wildcard";
import {
	EthereumAddress,
	EthereumSigner,
	EthereumSignature,
} from "#erdstall/crypto/ethereum";
import {
	SubstrateAddress,
	SubstrateSigner,
	SubstrateSignature,
} from "#erdstall/crypto/substrate";
import { Chain } from "#erdstall/ledger";
import { CodecReader, CodecWriter } from "#erdstall/utils";

export class LinkAccount extends Transaction {
	eth_auth?: EthereumSignature;
	subst_auth?: SubstrateSignature;
	accountID?: WildcardAddress;

	constructor(
		core: TxCore,
		public eth_addr: EthereumAddress | undefined,
		public subst_addr: SubstrateAddress | undefined,
		// whether to create a Wildcard account ID (u64) with this transaction. This is a security mechanism to prevent accidentally creating a new account ID when trying to merge accounts. If linking to an existing account, one address must already belong to that account.
		accountID: WildcardAddress | "create account ID",
	) {
		super(core);

		if (!eth_addr && !subst_addr)
			throw new Error("Need at least one address specified");

		if (accountID instanceof WildcardAddress) this.accountID = accountID;
		else if (accountID !== "create account ID")
			throw new Error("Invalid 'accountID' parameter");
	}

	// Authorises the transaction.
	async authorise_link(
		eth: EthereumSigner | undefined,
		subst: SubstrateSigner | undefined,
	): Promise<void> {
		let auth_stmt = new CodecWriter();
		auth_stmt.bytes(new TextEncoder().encode("Link accounts"));
		auth_stmt.opt_with(this.eth_addr, (v) => v.encode_impl(auth_stmt));
		auth_stmt.opt_with(this.subst_addr, (v) => v.encode_impl(auth_stmt));
		if (this.accountID instanceof WildcardAddress) {
			auth_stmt.bool(true);
			this.accountID.encode_impl(auth_stmt);
		} else auth_stmt.bool(false);

		let auth = auth_stmt.get();

		if (this.eth_addr) this.eth_auth = await eth!.sign(auth);
		if (this.subst_addr) this.subst_auth = await subst!.sign(auth);
	}

	override transactionType(): TransactionType {
		return TransactionType.LinkAccount;
	}
	override encode_impl(w: CodecWriter): void {
		w.opt_with(this.eth_addr, () => {
			this.eth_addr!.encode_impl(w);
			this.eth_auth!.encode_impl(w);
		});
		w.opt_with(this.subst_addr, () => {
			this.subst_addr!.encode_impl(w);
			this.subst_auth!.encode_impl(w);
		});

		w.opt_with(this.accountID, (v) => v.encode_impl(w));
	}

	static decode_impl(r: CodecReader, core: TxCore): LinkAccount {
		let [eth, eth_sig] = r.opt(() => [
			EthereumAddress.decode_impl(r),
			EthereumSignature.decode_impl(r),
		]) ?? [undefined, undefined];

		let [subst, subst_sig] = r.opt(() => [
			SubstrateAddress.decode_impl(r),
			SubstrateSignature.decode_impl(r),
		]) ?? [undefined, undefined];

		let accountID = r.opt(() => WildcardAddress.decode_impl(r));

		let tx = new LinkAccount(
			core,
			eth,
			subst,
			accountID ?? "create account ID",
		);
		tx.eth_auth = eth_sig;
		tx.subst_auth = subst_sig;

		return tx;
	}
}

_transactionDecoders.set(TransactionType.LinkAccount, LinkAccount.decode_impl);

export class LinkAccount_Output {
	constructor(public accountID: WildcardAddress) {}

	static decode(r: CodecReader): LinkAccount_Output {
		return new LinkAccount_Output(WildcardAddress.decode_impl(r));
	}
	static encode(w: CodecWriter, self: LinkAccount_Output): void {
		self.accountID.encode_impl(w);
	}
	encode(w: CodecWriter): void {
		LinkAccount_Output.encode(w, this);
	}
}
