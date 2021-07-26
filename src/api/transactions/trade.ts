// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Transaction } from "./transaction";
import { assets, Address } from "../../ledger";
import { jsonObject, jsonMember } from "typedjson";
import { ABIEncoder, ABIPacked, BigInteger } from "../util";
import { Signature } from "../signature";
import { Signer, utils } from "ethers";

@jsonObject
export class TradeFees {
	constructor(market: Address, fee: assets.Assets) {
		this.market = market;
		this.fee = fee;
	}
	@jsonMember(Address) market: Address;
	@jsonMember(assets.Assets) fee: assets.Assets;

	asABITagged(contract: Address): ABIPacked {
		return new ABIEncoder(this.market, this.fee).pack("ErdstallTradeFees", contract);
	}
}

@jsonObject
export class TradeOffer {
	@jsonMember(Address) owner: Address;
	@jsonMember(assets.Assets) offer: assets.Assets;
	@jsonMember(assets.Assets) request: assets.Assets;
	@jsonMember(BigInteger) expiry: BigInteger;
	@jsonMember(TradeFees) fees?: TradeFees;
	@jsonMember(Signature) sig?: Signature;

	constructor(
		owner: Address,
		offer: assets.Assets,
		request: assets.Assets)
	{
		this.owner = owner;
		this.offer = offer;
		this.request = request;
		this.expiry = new BigInteger(2n**64n - 1n); // For now, never expire.
		this.fees = undefined; // For now, ignore fees.
		this.sig = undefined;
	}

	async sign(contract: Address, signer: Signer): Promise<this> {
		const sig = await signer.signMessage(this.asABITagged(contract).keccak256());
		this.sig = new Signature(utils.arrayify(sig));
		return this;
	}

	verify(contract: Address): boolean {
		if (!this.sig) {
			return false;
		}
		const rec = utils.verifyMessage(
			this.asABITagged(contract).keccak256(),
			this.sig!.toString(),
		);

		return rec === this.owner.toString();
	}

	asABITagged(contract: Address): ABIPacked {
		return new ABIEncoder().encodeTagged(contract,
			this.owner,
			this.offer,
			["uint64", this.expiry],
			this.request,
			this.fees ? this.fees! : new Uint8Array(),
		).pack("ErdstallTradeOffer", contract);
	}
}

@jsonObject
export class Trade extends Transaction {
	@jsonMember(TradeOffer) offer: TradeOffer;

	constructor(
		sender: Address,
		nonce: bigint,
		offer: TradeOffer,
	) {
		super(sender, nonce);
		this.offer = offer;
	}

	public txType() {
		return Trade;
	}
	protected txTypeName(): string {
		return "Trade";
	}
	protected encodeABI(e: ABIEncoder, contract: Address): string {
		e.encodeTagged(contract, this.offer.sig!, ["bytes", utils.hexlify(this.offer.asABITagged(contract).bytes)]);
		return "ErdstallTradeTX";
	}
}
