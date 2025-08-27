// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Transaction,
	TransactionType,
	_transactionDecoders,
	TxCore,
} from "./transaction";
import { ChainAssets } from "#erdstall/ledger/assets";
import { CodecReader, CodecWriter } from "#erdstall/utils";

export class Burn extends Transaction {
	constructor(
		core: TxCore,
		public values: ChainAssets,
	) {
		super(core);
	}

	override transactionType(): TransactionType {
		return TransactionType.Burn;
	}
	override encode_impl(w: CodecWriter): void {
		this.values.encode(w);
	}
	static decode_impl(r: CodecReader, core: TxCore): Burn {
		return new Burn(core, ChainAssets.decode(r));
	}
}

_transactionDecoders.set(TransactionType.Burn, Burn.decode_impl);
