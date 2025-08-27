// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Transaction,
	TransactionType,
	_transactionDecoders,
	TxCore,
} from "./transaction";
import { ChainAssets } from "#erdstall/ledger/assets";
import { Address } from "#erdstall/crypto";
import { CodecReader, CodecWriter } from "#erdstall/utils";

export class Transfer extends Transaction {
	constructor(
		core: TxCore,
		public recipient: Address,
		public values: ChainAssets,
	) {
		super(core);
	}

	override transactionType(): TransactionType {
		return TransactionType.Transfer;
	}
	override encode_impl(w: CodecWriter): void {
		this.recipient.encode(w);
		this.values.encode(w);
	}
	static decode_impl(r: CodecReader, core: TxCore): Transfer {
		return new Transfer(core, Address.decode(r), ChainAssets.decode(r));
	}
}
_transactionDecoders.set(TransactionType.Transfer, Transfer.decode_impl);
