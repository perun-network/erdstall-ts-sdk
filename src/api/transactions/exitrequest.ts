// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Transaction,
	TransactionType,
	NonceCheck,
	_transactionDecoders,
	TxCore,
} from "./transaction";
import { Address } from "#erdstall/crypto";
import { Chain } from "#erdstall/ledger";
import { CodecReader, CodecWriter } from "#erdstall/utils";

export class FullExit extends Transaction {
	constructor(
		core: TxCore,
		public destination?: Chain,
	) {
		super(core);
	}

	override transactionType(): TransactionType {
		return TransactionType.FullExit;
	}
	override encode_impl(w: CodecWriter): void {
		w.u16(this.destination ?? 0);
	}
	static decode_impl(r: CodecReader, core: TxCore): FullExit {
		return new FullExit(core, r.u16() || undefined);
	}
}

_transactionDecoders.set(TransactionType.FullExit, FullExit.decode_impl);
