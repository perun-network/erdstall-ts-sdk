// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Transaction,
	TransactionType,
	_transactionDecoders,
	TxCore,
} from "./transaction";
import { Asset } from "#erdstall/ledger/assets";
import { CodecReader, CodecWriter } from "#erdstall/utils";

export class Mint extends Transaction {
	constructor(
		core: TxCore,
		public token: Uint8Array & { length: 32 },
		public value: Asset,
	) {
		super(core);
		if (token.length !== 32) throw new Error("invalid token size");
	}

	override transactionType(): TransactionType {
		return TransactionType.Mint;
	}
	override encode_impl(w: CodecWriter): void {
		w.bytes<32>(this.token);
		Asset.encode(w, this.value);
	}
	static decode_impl(r: CodecReader, core: TxCore): Mint {
		return new Mint(core, r.bytes(32), Asset.decode(r));
	}
}

_transactionDecoders.set(TransactionType.Mint, Mint.decode_impl);
