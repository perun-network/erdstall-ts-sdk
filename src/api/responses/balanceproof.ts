// SPDX-License-Identifier: Apache-2.0
"use strict";

import { jsonObject } from "#erdstall/export/typedjson";
import { ChainAssets } from "#erdstall/ledger/assets";
import {
	Address,
	Signature,
	SignedMessage,
	SigVerifier,
} from "#erdstall/crypto";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Chain } from "#erdstall/ledger";
import { customJSON } from "#erdstall/api/util";
import { CodecReader, CodecWriter } from "#erdstall/utils";

const balanceProofsTypeName = "BalanceProofs";

@jsonObject
export class SignedBalanceProof extends ErdstallObject {
	constructor(readonly sig: SignedMessage<BalanceProof>) {
		super();
	}

	public async verify(v: SigVerifier): Promise<BalanceProof | undefined> {
		let decoded = await v.verifySig(this.sig);
		if (!decoded) return undefined;

		return BalanceProof.decode(new CodecReader(decoded));
	}

	override objectType() {
		return SignedBalanceProof;
	}
	override objectTypeName(): string {
		return balanceProofsTypeName;
	}

	static toJSON(me: SignedBalanceProof): string {
		const w = new CodecWriter();
		SignedBalanceProof.encode(w, me);
		return w.getAsString();
	}

	static fromJSON(json: string): SignedBalanceProof {
		return SignedBalanceProof.decode(CodecReader.fromString(json));
	}

	encode(w: CodecWriter): void {
		SignedBalanceProof.encode(w, this);
	}
	static encode(w: CodecWriter, self: SignedBalanceProof): void {
		self.sig.encode(w);
	}

	static decode(r: CodecReader): SignedBalanceProof {
		return new SignedBalanceProof(SignedMessage.decode(r));
	}
}

registerErdstallType(balanceProofsTypeName, SignedBalanceProof);
customJSON(SignedBalanceProof);

export class BalanceProof {
	constructor(
		// Address => (chain => funds), in case we have multiple chains with the same address.
		readonly proofs: Map<string, Map<Chain, ChainProof>>,
		readonly epoch: bigint,
	) {}

	encode(w: CodecWriter): void {
		BalanceProof.encode(w, this);
	}
	static encode(w: CodecWriter, self: BalanceProof): void {
		w.map_with(
			self.proofs,
			(addr) => Address.encode(w, Address.fromKey(addr)),
			(proofs) =>
				w.map_with(
					proofs,
					(chain) => w.u16(chain),
					(proof) => proof.encode(w),
				),
		);
		w.u64(self.epoch);
	}

	static decode(r: CodecReader): BalanceProof {
		return new BalanceProof(
			r.map(
				() => Address.decode(r).key,
				() =>
					r.map<Chain, ChainProof>(
						() => r.u16(),
						() => ChainProof.decode(r),
					),
			),
			r.u64(),
		);
	}
}

export class ChainProofChunk {
	constructor(
		public funds: ChainAssets,
		public sig: Signature,
	) {}

	clone(): ChainProofChunk {
		return new ChainProofChunk(this.funds.clone(), this.sig.clone());
	}

	encode(w: CodecWriter): void {
		ChainProofChunk.encode(w, this);
	}
	static encode(w: CodecWriter, v: ChainProofChunk): void {
		v.funds.encode(w);
		Signature.encode(w, v.sig);
	}
	static decode(r: CodecReader): ChainProofChunk {
		return new ChainProofChunk(ChainAssets.decode(r), Signature.decode(r));
	}
}

export class ChainProof {
	constructor(
		readonly exit: ChainProofChunk[],
		readonly recovery: ChainProofChunk[],
	) {}

	encode(w: CodecWriter): void {
		ChainProof.encode(w, this);
	}
	static encode(w: CodecWriter, v: ChainProof): void {
		w.array(v.exit);
		w.array(v.recovery);
	}
	static decode(r: CodecReader): ChainProof {
		return new ChainProof(
			r.array(ChainProofChunk.decode),
			r.array(ChainProofChunk.decode),
		);
	}
}
