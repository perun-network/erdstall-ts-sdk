// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction, registerTransactionType } from "./transaction";
import { Address } from "#erdstall/ledger";
import * as assets from "#erdstall/ledger/assets";
import {
	jsonObject,
	jsonMember,
	jsonBigIntMember,
} from "#erdstall/export/typedjson";
import { ABIEncoder, ABIPacked } from "#erdstall/api/util";
import { Signature } from "#erdstall/api";
import { Signer, utils } from "ethers";

@jsonObject
export class TradeFees {
	@jsonMember(Address) market: Address;
	@jsonMember(() => assets.Assets) fee: assets.Assets;

	constructor(market: Address, fee: assets.Assets) {
		this.market = market;
		this.fee = fee;
	}

	packTagged(contract: Address): ABIPacked {
		return new ABIEncoder(this.market, this.fee).pack(
			"ErdstallTradeFees",
			contract,
		);
	}
}

const tradeTypeName = "Trade";

@jsonObject
export class TradeOffer {
	@jsonMember(Address) owner: Address;
	@jsonMember(() => assets.Assets) offer: assets.Assets;
	@jsonMember(() => assets.Assets) request: assets.Assets;
	@jsonBigIntMember() expiry: bigint;
	@jsonMember(TradeFees) fees?: TradeFees;
	@jsonMember(Signature) sig?: Signature;

	constructor(owner: Address, offer: assets.Assets, request: assets.Assets) {
		this.owner = owner;
		this.offer = offer;
		this.request = request;
		this.expiry = (1n << 64n) - 1n; // For now, never expire.
	}

	async sign(contract: Address, signer: Signer): Promise<SignedTradeOffer> {
		const sig = await signer.signMessage(
			this.packTagged(contract).keccak256(),
		);
		this.sig = new Signature(sig);
		return this as SignedTradeOffer;
	}

	verify(contract: Address): boolean {
		if (!this.sig) {
			return false;
		}
		const rec = utils.verifyMessage(
			this.packTagged(contract).keccak256(),
			this.sig!.toString(),
		);

		return rec === this.owner.toString();
	}

	packTagged(contract: Address): ABIPacked {
		return new ABIEncoder()
			.encodeTagged(
				contract,
				this.owner,
				this.offer,
				["uint64", this.expiry],
				this.request,
				this.fees ? this.fees! : new Uint8Array(),
			)
			.pack("ErdstallTradeOffer", contract);
	}
}

export type SignedTradeOffer = TradeOffer & { sig: Signature };

@jsonObject
export class Trade extends Transaction {
	@jsonMember(TradeOffer) offer: TradeOffer;

	constructor(sender: Address, nonce: bigint, offer: TradeOffer) {
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
	protected encodeABI(e: ABIEncoder, contract: Address): string {
		e.encodeTagged(contract, this.offer.sig!, this.offer);
		return "ErdstallTradeTX";
	}
}

registerTransactionType(tradeTypeName, Trade);
