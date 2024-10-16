// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonObject,
	jsonMember,
	jsonU64Member,
	jsonArrayMember,
	jsonMapMember,
	MapShape,
	MapT,
	TypedJSON,
} from "#erdstall/export/typedjson";
import { ChainAssets } from "#erdstall/ledger/assets";
import * as crypto from "#erdstall/crypto";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { Backend } from "#erdstall/ledger/backend";
import { Chain } from "#erdstall/ledger/chain";
import { BackendSignature, ErdstallSignature } from "#erdstall/erdstall";
import canonicalize from "canonicalize";
import { customJSON } from "#erdstall/api/util";

const balanceProofsTypeName = "BalanceProofs";

// Balance is the value of funds for the account within epoch.
@jsonObject
export class Balance {
	@jsonU64Member() epoch: bigint;
	@jsonMember(crypto.Address) account: crypto.Address<crypto.Crypto>;
	@jsonMember(Boolean) exit: boolean;
	@jsonMember(() => ChainAssets) values: ChainAssets;

	constructor(
		epoch: bigint,
		account: crypto.Address<crypto.Crypto> | string,
		exit: boolean,
		values: ChainAssets,
	) {
		this.epoch = epoch;
		this.account = crypto.Address.ensure(account);
		this.exit = exit;
		this.values = values;
	}
}

// BalanceProofs are generated by the Enclave at the end of each transaction
// phase for each account in the Erdstall system.
@jsonObject
export class BalanceProofs extends ErdstallObject {
	accounts: Map<string, BalanceProof>;

	constructor() { super(); this.accounts = new Map(); }

	static toJSON(me: BalanceProofs) {
		const json: any = {};
		me.accounts.forEach((bp, key) => {
			json[key] = TypedJSON.toPlainJson(bp, BalanceProof);
		});
		return json;
	}

	static fromJSON(json: any): BalanceProofs {
		const bps = new BalanceProofs();
		for(let key in json) {
			bps.accounts.set(key, TypedJSON.parse(json[key], BalanceProof)!);
		}
		return bps;
	}

	public objectType() {
		return BalanceProofs;
	}
	protected objectTypeName() {
		return balanceProofsTypeName;
	}

}

@jsonObject
export class BalanceProof {
	// Account Address -> Chain -> ChainProof.
	// It might be that an account address has multiple entries for different
	// chains IFF the chains support the same crypto for addresses.
	//
	// E.g.: Polkadot can be compatible with Ethereum addresses. In that case
	// we would have:
	//                      .-> <PolkadotChain> -> <ChainProof>
	//                     /
	// <EthereumAddress> -|
	//                     \
	//                      '-> <EthereumChain> -> <ChainProof>
	@jsonMapMember(
		String,
		() => MapT(String, ChainProof, { shape: MapShape.OBJECT }),
		{
			shape: MapShape.OBJECT,
		},
	)
	readonly proofs: Map<string, Map<Chain, ChainProof>>;
	@jsonU64Member()
	readonly epoch: bigint;

	@jsonMember(crypto.Signature)
	readonly sig?: crypto.Signature<crypto.Crypto>;

	constructor(
		proofs: Map<string, Map<Chain, ChainProof>>,
		epoch: bigint,
		sig?: ErdstallSignature,
	) {
		this.proofs = proofs;
		this.sig = sig;
		this.epoch = epoch;
	}

	public verify(address: crypto.Address<crypto.Crypto>): boolean {
		return this.sig?.verify(
			this.encodePayload(),
			address) ? true : false;
	}

	public encodePayload(): Uint8Array {
		const toEncode = TypedJSON.toPlainJson(
			new BalanceProof(this.proofs, this.epoch, undefined), BalanceProof);
		const msg = canonicalize(toEncode);
		const enc = new TextEncoder();
		return enc.encode(msg);
	}
}

@jsonObject
export class ChainProofChunk {
	@jsonMember(ChainAssets, { preserveNull: true })
	funds: ChainAssets;

	// ChainProofChunks are issued for specific chains, so the signature is
	// specifically a BackendSignature.
	@jsonMember(crypto.Signature, { preserveNull: true })
	sig: BackendSignature<Backend>;

	constructor(funds: ChainAssets, sig: BackendSignature<Backend>) {
		this.funds = funds;
		this.sig = sig;
	}
}

@jsonObject
export class ChainProof {
	@jsonArrayMember(ChainProofChunk)
	readonly exit: ChainProofChunk[];
	@jsonArrayMember(ChainProofChunk)
	readonly recovery: ChainProofChunk[];

	constructor(exit: ChainProofChunk[], recovery: ChainProofChunk[]) {
		this.exit = exit;
		this.recovery = recovery;
	}
}

registerErdstallType(balanceProofsTypeName, BalanceProofs);
customJSON(BalanceProofs);
