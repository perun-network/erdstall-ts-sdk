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

// Authorises keys for a watcher TEE so that they can be uses to post proofs on-chain.
export class RegisterWatcher extends Transaction {
	constructor(
		core: TxCore,
		public chain: Chain, // the chain being watched.
		public identity: Map<Chain, Address>, // the proof signing keys
		public quote: Uint8Array,
	) {
		super(core);
	}

	override transactionType(): TransactionType {
		return TransactionType.FullExit;
	}
	override encode_impl(w: CodecWriter): void {
		w.u16(this.chain);
		w.array_with(Array.from(this.identity.entries()), ([chain, addr]) => {
			w.u16(chain);
			addr.encode(w);
		});
		w.bytes(this.quote);
	}
	static decode_impl(r: CodecReader, core: TxCore): RegisterWatcher {
		return new RegisterWatcher(
			core,
			r.u16() as Chain,
			new Map(r.array<[Chain, Address]>(() => [r.u16(), Address.decode(r)])),
			r.rest(),
		);
	}
}

_transactionDecoders.set(
	TransactionType.RegisterWatcher,
	RegisterWatcher.decode_impl,
);
