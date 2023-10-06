// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import * as assets from "#erdstall/ledger/assets";
import {
	jsonObject,
	jsonMember,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";
import { ABIPacked } from "#erdstall/api/util";
import { Address, Signature, Crypto } from "#erdstall/crypto";
import { utils } from "ethers";
import { Signer } from "#erdstall/ledger/backend";

@jsonObject
export class TradeFees {
	@jsonMember(Address) market: Address<Crypto>;
	@jsonMember(() => assets.ChainAssets) fee: assets.ChainAssets;

	constructor(market: Address<Crypto>, fee: assets.ChainAssets) {
		this.market = market;
		this.fee = fee;
	}

	packTagged(): ABIPacked {
		throw new Error("Method not implemented.");
		// return new ABIEncoder(this.market, this.fee).pack("ErdstallTradeFees");
	}
}

const tradeTypeName = "Trade";

@jsonObject
export class TradeOffer {
	@jsonMember(Address) owner: Address<Crypto>;
	@jsonMember(() => assets.ChainAssets) offer: assets.ChainAssets;
	@jsonMember(() => assets.ChainAssets) request: assets.ChainAssets;
	@jsonBigIntMember() expiry: bigint;
	@jsonMember(TradeFees) fees?: TradeFees;
	@jsonMember(Signature) sig?: Signature<Crypto>;

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
		this.sig = await signer.signMessage(this.packTagged().keccak256());
		return this;
	}

	verify(): boolean {
		if (!this.sig) {
			return false;
		}
		const rec = utils.verifyMessage(
			this.packTagged().keccak256(),
			this.sig!.toString(),
		);

		return rec === this.owner.toString();
	}

	packTagged(): ABIPacked {
		throw new Error("Method not implemented.");
		// return new ABIEncoder()
		// 	.encodeTagged(
		// 		this.owner,
		// 		this.offer,
		// 		["uint64", this.expiry],
		// 		this.request,
		// 		this.fees ? this.fees! : new Uint8Array(),
		// 	)
		// 	.pack("ErdstallTradeOffer");
	}
}

@jsonObject
export class Trade extends Transaction {
	@jsonMember(TradeOffer) offer: TradeOffer;

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
