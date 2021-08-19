// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer, utils } from "ethers";
import { TypedJSON, jsonObject, jsonMember } from "typedjson";
import {
	BigInteger,
	CustomJSON,
	ABIPacked,
	ABIEncoder,
} from "#erdstall/api/util";
import { Assets } from "#erdstall/ledger/assets";
import { Address } from "#erdstall/ledger";
import { Signature } from "#erdstall/api";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";

const balanceProofsTypeName = "BalanceProofs";

// Balance is the value of funds for the account within epoch.
@jsonObject
export class Balance {
	@jsonMember(BigInteger) epoch: BigInteger;
	@jsonMember(Address) account: Address;
	@jsonMember(Boolean) exit: boolean;
	@jsonMember(() => Assets) values: Assets;

	constructor(
		epoch: bigint,
		address: Address,
		exit: boolean,
		values: Assets,
	) {
		this.epoch = new BigInteger(epoch);
		this.account = address;
		this.exit = exit;
		this.values = values;
	}

	// (uint64,address,bool,tuple(address,bytes)[])
	asABI(): ErdstallBalance {
		return {
			epoch: this.epoch.valueOf(),
			account: this.account.toString(),
			exit: this.exit,
			tokens: this.values.asABI(),
		};
	}

	packTagged(contract: Address): ABIPacked {
		return new ABIEncoder(
			["uint64", this.epoch],
			this.account,
			this.exit,
			this.values,
		).pack("ErdstallBalance", contract);
	}

	async sign(contract: Address, signer: Signer): Promise<BalanceProof> {
		const sig = await signer.signMessage(
			this.packTagged(contract).keccak256(),
		);
		return new BalanceProof(this, new Signature(utils.arrayify(sig)));
	}
}

export interface ErdstallBalance {
	epoch: ethers.BigNumberish;
	account: string;
	exit: boolean;
	tokens: ErdstallToken[];
}

export interface ErdstallToken {
	token: string;
	value: ethers.utils.BytesLike;
}

export type ErdstallSignature = ethers.utils.BytesLike;

// A BalanceProof is generated by the Enclave at the end of each transaction
// phase for each account in the Erdstall system.
@jsonObject
export class BalanceProof {
	@jsonMember(Balance)
	readonly balance: Balance;
	@jsonMember(Signature)
	readonly sig: Signature;

	constructor(balance: Balance, signature: Signature) {
		this.balance = balance;
		this.sig = signature;
	}

	toEthProof(): [ErdstallBalance, ErdstallSignature] {
		return [this.balance.asABI(), this.sig.value];
	}

	verify(contract: Address, tee: Address): boolean {
		const signer = utils.verifyMessage(
			this.balance.packTagged(contract).keccak256(),
			this.sig.toString(),
		);
		return signer === tee.toString();
	}
}

@jsonObject
export class BalanceProofs extends ErdstallObject {
	public map: Map<string, BalanceProof>;
	constructor() {
		super();
		this.map = new Map<string, BalanceProof>();
	}

	static toJSON(me: BalanceProofs): any {
		var obj: any = {};
		me.map.forEach((bp, addr) => {
			obj[addr] = JSON.parse(TypedJSON.stringify(bp, BalanceProof));
		});
		return obj;
	}

	static fromJSON(data: any): BalanceProofs {
		const bps = new BalanceProofs();
		for (const addr in data) {
			bps.map.set(
				addr,
				TypedJSON.parse(JSON.stringify(data[addr]), BalanceProof)!,
			);
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

registerErdstallType(balanceProofsTypeName, BalanceProofs);
CustomJSON(BalanceProofs);
