// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Transaction,
	_transactionDecoders,
	TransactionType,
	TxCore,
} from "#erdstall/api/transactions";
import { AESGCMKey, DHPair, DHPK } from "#erdstall/crypto/wildcard";
import { CodecReader, CodecWriter } from "#erdstall/utils";

export class SetPrivacy extends Transaction {
	constructor(
		core: TxCore,
		public dh_pair: DHPair | undefined,
	) {
		super(core);
	}

	override transactionType() {
		return TransactionType.SetPrivacy;
	}

	override encode_impl(w: CodecWriter): void {
		w.opt_with(this.dh_pair, (v) => v.encode_pk(w));
	}
	static decode_impl(r: CodecReader, core: TxCore): SetPrivacy {
		throw new Error("Cannot decode a DH pair");
	}

	async decrypt_output(o: SetPrivacy_Output): Promise<AESGCMKey | undefined> {
		return await this.dh_pair?.deriveSharedKey(o.tempDH!);
	}
}
_transactionDecoders.set(TransactionType.SetPrivacy, SetPrivacy.decode_impl);

export class SetPrivacy_Output {
	constructor(public tempDH?: DHPK) { }

	static decode(r: CodecReader): SetPrivacy_Output {
		return new SetPrivacy_Output(r.opt(DHPK.decode));
	}

	encode(w: CodecWriter): void {
		w.opt(this.tempDH);
	}
}
