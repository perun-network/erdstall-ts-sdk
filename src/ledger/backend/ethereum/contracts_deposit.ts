// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, BigNumber } from "ethers";

import {
	ERC721Holder__factory,
	ERC20Holder__factory,
	IERC721__factory,
	ETHHolder__factory,
	IERC20__factory,
} from "./contracts";
import {
	EthereumAddress as Address,
	EthereumSigner as Signer,
} from "#erdstall/crypto/ethereum";
import { Asset } from "#erdstall/ledger/assets";
import { Amount } from "#erdstall/ledger/assets";
import { Tokens } from "#erdstall/ledger/assets";
import { Calls } from "./tokenmanager";

export function makeETHDepositCalls(
	signer: Signer,
	holderAddr: Address,
	_: Address,
	amount: Asset,
): Calls {
	if (!(amount instanceof Amount)) {
		throw new Error("given value is not of type Amount");
	}

	const holder = ETHHolder__factory.connect(
		holderAddr.toString(),
		signer.ethersSigner);

	return [
		[
			"deposit",
			(
				obj?: ethers.PayableOverrides,
			): Promise<ethers.ContractTransaction> => {
				const combinedOverride = {
					...{ value: BigNumber.from(amount.value) },
					...obj,
				};
				return holder.deposit(combinedOverride);
			},
		],
	];
}

export function makeERC20DepositCalls(
	signer: Signer,
	holderAddr: Address,
	tokenAddr: Address,
	amount: Asset,
): Calls {
	if (!(amount instanceof Amount)) {
		throw new Error("given value is not of type Amount");
	}

	const token = IERC20__factory.connect(
		tokenAddr.toString(),
		signer.ethersSigner);
	const holder = ERC20Holder__factory.connect(
		holderAddr.toString(),
		signer.ethersSigner);

	return [
		[
			"approve",
			(
				obj?: ethers.PayableOverrides,
			): Promise<ethers.ContractTransaction> => {
				return token.approve(
					holderAddr.toString(),
					BigNumber.from(amount.value),
					obj,
				);
			},
		],
		[
			"deposit",
			(
				obj?: ethers.PayableOverrides,
			): Promise<ethers.ContractTransaction> => {
				return holder.deposit(
					tokenAddr.toString(),
					BigNumber.from(amount.value),
					obj,
				);
			},
		],
	];
}

export function makeERC721DepositCalls(
	signer: Signer,
	holderAddr: Address,
	tokenAddr: Address,
	amount: Asset,
): Calls {
	if (!(amount instanceof Tokens)) {
		throw new Error("given value is not of type Tokens");
	}

	const token = IERC721__factory.connect(
		tokenAddr.toString(),
		signer.ethersSigner);
	const holder = ERC721Holder__factory.connect(
		holderAddr.toString(),
		signer.ethersSigner);

	const calls: Calls = [];

	for (const id of amount.value) {
		calls.push([
			"approve",
			(
				obj?: ethers.PayableOverrides,
			): Promise<ethers.ContractTransaction> => {
				return token.approve(
					holderAddr.toString(),
					BigNumber.from(id),
					obj,
				);
			},
		]);
	}

	calls.push([
		"deposit",
		(
			obj?: ethers.PayableOverrides,
		): Promise<ethers.ContractTransaction> => {
			return holder.deposit(
				tokenAddr.toString(),
				amount.value.map(BigNumber.from),
				obj,
			);
		},
	]);

	return calls;
}
