// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import * as assets from "#erdstall/ledger/assets";
import {
	jsonObject,
	jsonMember,
	jsonU64Member,
	TypedJSON,
} from "#erdstall/export/typedjson";
import { Address, Signature, Crypto, Signer } from "#erdstall/crypto";
import canonicalize from "canonicalize";

@jsonObject
export class TradeFees {
	@jsonMember(() => Address) market: Address<Crypto>;
	@jsonMember(() => assets.ChainAssets) fee: assets.ChainAssets;

	constructor(market: Address<Crypto>, fee: assets.ChainAssets) {
		this.market = market;
		this.fee = fee;
	}

	encodePayload(): Uint8Array {
		const json = JSON.parse(TypedJSON.stringify(this, TradeFees));
		const msg = canonicalize({
			value: json
		});
		return new TextEncoder().encode(msg);
	}
}

const tradeTypeName = "Trade";

@jsonObject
export class TradeOffer {
	@jsonMember(() => Address) owner: Address<Crypto>;
	@jsonMember(() => assets.ChainAssets) offer: assets.ChainAssets;
	@jsonMember(() => assets.ChainAssets) request: assets.ChainAssets;
	@jsonU64Member() expiry: bigint;
	@jsonMember(() => TradeFees) fees?: TradeFees;
	@jsonMember(() => Signature) sig?: Signature<Crypto>;

	constructor(
		owner: Address<Crypto>,
		offer: assets.ChainAssets,
		request: assets.ChainAssets,
	) {
		this.owner = owner;
		this.offer = offer;
		this.request = request;
		this.expiry = (1n << 64n) - 1n; // For now, never expire.
	}

	async sign(signer: Signer<Crypto>): Promise<this> {
		this.owner = await signer.address();
		this.sig = await signer.sign(this.encodePayload());
		return this;
	}

	verify(signer: Address<Crypto>): boolean {
		if (!this.sig) {
			return false;
		}
		return this.sig.verify(
			this.encodePayload(),
			signer
		);
	}

	encodePayload(): Uint8Array {
		const json = JSON.parse(TypedJSON.stringify(this, TradeOffer));
		delete json.sig;

		const msg = canonicalize({
			value: json,
		});
		return new TextEncoder().encode(msg);
	}
}

@jsonObject
export class Trade extends Transaction {
	@jsonMember(() => TradeOffer) offer: TradeOffer;

	constructor(sender: Address<Crypto>, nonce: bigint, offer: TradeOffer) {
		super(sender, nonce);
		// Otherwise, throws "TypeError: Cannot read property 'sig' of undefined" in TypedJSON.parse.
		if (offer && !offer.sig) throw new Error("trade offer must be signed");
		this.offer = offer;
	}

	public txType() {
		return Trade;
	}
	protected txTypeName(): string {
		return tradeTypeName;
	}
}

registerTransactionType(tradeTypeName, Trade);
