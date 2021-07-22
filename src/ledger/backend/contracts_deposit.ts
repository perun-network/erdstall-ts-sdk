// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer, BigNumber } from "ethers";

import { ETHHolder__factory } from "./contracts/factories/ETHHolder__factory";
import { IERC20__factory } from "./contracts/factories/IERC20__factory";
import { IERC721__factory } from "./contracts/factories/IERC721__factory";
import { ERC20Holder__factory } from "./contracts/factories/ERC20Holder__factory";
import { ERC721Holder__factory } from "./contracts/factories/ERC721Holder__factory";
import { Address } from "#erdstall/ledger";
import { Asset } from "#erdstall/ledger/assets";
import { Amount } from "#erdstall/ledger/assets";
import { Tokens } from "#erdstall/ledger/assets";
import { DepositCalls } from "./tokenmanager";

export function makeETHDepositCalls(
	signer: Signer,
	holderAddr: Address,
	_: Address,
	amount: Asset,
): DepositCalls {
	if (!(amount instanceof Amount)) {
		throw new Error("given value is not of type Amount");
	}

	const holder = ETHHolder__factory.connect(holderAddr.toString(), signer);

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
): DepositCalls {
	if (!(amount instanceof Amount)) {
		throw new Error("given value is not of type Amount");
	}

	const token = IERC20__factory.connect(tokenAddr.toString(), signer);
	const holder = ERC20Holder__factory.connect(holderAddr.toString(), signer);

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
): DepositCalls {
	if (!(amount instanceof Tokens)) {
		throw new Error("given value is not of type Tokens");
	}

	const token = IERC721__factory.connect(tokenAddr.toString(), signer);
	const holder = ERC721Holder__factory.connect(holderAddr.toString(), signer);

	const calls: DepositCalls = [];

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
