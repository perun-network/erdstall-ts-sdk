// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Transaction,
	TransactionType,
	NonceCheck,
	_transactionDecoders,
	TxCore
} from "./transaction";
import { Address, Signature, Signer } from "#erdstall/crypto";
import { Chain } from "#erdstall/ledger";
import { CodecReader, CodecWriter } from "#erdstall/utils";

export class LinkAccount extends Transaction {

	constructor(
		core: TxCore,
	public linkTarget: Address,
	public linkAuth?: Signature
		) { super(core); }

	async authorise_link(s: Signer): Promise<void>
	{
		let auth_stmt = new CodecWriter();
		auth_stmt.bytes(new TextEncoder().encode("Link accounts"));
		this.sender.encode(auth_stmt);
		this.linkTarget.encode(auth_stmt);
		this.linkAuth = await s.sign(auth_stmt.get());
	}

	override transactionType(): TransactionType
		{ return TransactionType.LinkAccount; }
	override encode_impl(w: CodecWriter): void
		{ this.linkTarget.encode(w); this.linkAuth!.encode(w); }
	static decode_impl(r: CodecReader, core: TxCore): LinkAccount
	{
		return new LinkAccount(core,
			Address.decode(r),
			Signature.decode(r));
	}
}

_transactionDecoders.set(TransactionType.LinkAccount, LinkAccount.decode_impl);