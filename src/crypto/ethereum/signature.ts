// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { registerSignatureType, Signature } from "#erdstall/crypto/signature";
import { EthereumAddress } from "./address";
import { Address } from "#erdstall/crypto/address";
import { jsonMember, jsonObject } from "#erdstall/export/typedjson";

@jsonObject
export class EthereumSignature extends Signature<"ethereum"> {
	@jsonMember msg: Uint8Array;
	@jsonMember address: Address<"ethereum">;

	constructor(value: Uint8Array, address: Address<"ethereum">) {
		super();
		this.msg = value;
		this.address = address;
	}

	static fromJSON(data: any): Signature<"ethereum"> {
		const address = EthereumAddress.fromJSON(data.address);
		const value = utils.arrayify(data.msg);
		return new EthereumSignature(value, address);
	}

	toJSON() {
		return {
			address: this.address,
			msg: utils.hexlify(this.msg),
		};
	}

	toString(): string {
		return utils.hexlify(this.msg);
	}

	toBytes(): Uint8Array {
		return this.msg;
	}

	asABI() {
		return this.msg;
	}

	ABIType(): string {
		return "bytes";
	}

	type(): "ethereum" {
		return "ethereum";
	}
}

registerSignatureType("ethereum", EthereumSignature);
