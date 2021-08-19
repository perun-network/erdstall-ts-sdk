// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { ethers } from "ethers";
import { Wallet } from "ethers";
import { providers } from "ethers";
import { deployContract } from "ethereum-waffle";
import { MockProvider } from "ethereum-waffle";

import { Erdstall__factory } from "#erdstall/ledger/backend/contracts";
import { ETHZERO } from "#erdstall/ledger/assets";

const peruntokenABI = require("../../ledger/backend/contracts/abi/PerunToken.json");
const erdstallABI = require("../../ledger/backend/contracts/abi/Erdstall.json");
const erc20holderABI = require("../../ledger/backend/contracts/abi/ERC20Holder.json");
const erc721holderABI = require("../../ledger/backend/contracts/abi/ERC721Holder.json");
const ethholderABI = require("../../ledger/backend/contracts/abi/ETHHolder.json");

export interface Enviroment {
	provider: providers.Web3Provider;
	perun: string;
	erdstall: string;
	ethHolder: string;
	erc20Holder: string;
	erc721Holder: string;
	op: Wallet;
	tee: Wallet;
	users: Wallet[];
}

const gProvider = new MockProvider();
const wallets = gProvider.getWallets();
const OP = 0,
	TEE = 1;

export async function setupEnv(
	numOfPrefundedAccounts: number = 1,
	epochDuration: number = 3,
	lprovider?: providers.Web3Provider,
	lop?: Wallet,
	pacc?: Wallet,
): Promise<Enviroment> {
	const provider = lprovider ? lprovider : gProvider;

	const op = lop ? lop : wallets[OP];
	const tee = wallets[TEE];
	const users = pacc
		? [pacc]
		: wallets.slice(TEE + 1, TEE + 1 + numOfPrefundedAccounts);

	const perunContract = 0,
		erdstallContract = 1,
		ethHolderContract = 2,
		erc20HolderContract = 3,
		erc721HolderContract = 4;
	const contractDeployments = [
		[
			peruntokenABI,
			[
				users.map((u) => {
					return u.address;
				}),
				utils.parseEther("100000").toBigInt(),
			],
		],
		[erdstallABI, [tee.address, epochDuration]],
	];

	let nonce: number = await op.getTransactionCount();
	let contracts: ethers.Contract[] = [];
	// Trying to do this with a `arr.map(...)` causes nonce issues.
	for (const [abi, args] of contractDeployments) {
		const contract = await deployContract(op, abi, args, {
			nonce: nonce++,
		});
		contracts.push(contract);
	}

	const erdstall = Erdstall__factory.connect(
		contracts[erdstallContract].address,
		op,
	);

	const holderDeployments = [
		[ethholderABI, [erdstall.address]],
		[erc20holderABI, [erdstall.address]],
		[erc721holderABI, [erdstall.address]],
	];

	for (const [abi, args] of holderDeployments) {
		const contract = await deployContract(op, abi, args, {
			nonce: nonce++,
		});
		contracts.push(contract);
	}

	let txs: Promise<ethers.ContractTransaction>[] = [];
	[
		[contracts[ethHolderContract].address, "ETH"],
		[contracts[erc20HolderContract].address, "ERC20"],
		[contracts[erc721HolderContract].address, "ERC721"],
	].forEach(async ([addr, ttype]) => {
		txs.push(
			erdstall.registerTokenType(addr, ttype, {
				nonce: nonce++,
			}),
		);
	});

	for (const txp of txs) {
		const tx = await txp;
		const rec = await tx.wait();
		if (!rec.status || rec.status !== 1) {
			Promise.reject(
				new Error("unable register token types on erdstall contract"),
			);
		}
	}

	txs = [];
	[
		[ETHZERO, contracts[ethHolderContract].address],
		[
			contracts[perunContract].address,
			contracts[erc20HolderContract].address,
		],
	].forEach(async ([token, holder]) => {
		txs.push(erdstall.registerToken(token, holder, { nonce: nonce++ }));
	});

	for (const txp of txs) {
		const tx = await txp;
		const rec = await tx.wait();
		if (!rec.status || rec.status !== 1) {
			Promise.reject(
				new Error("unable register tokens on erdstall contract"),
			);
		}
	}

	return {
		provider: provider,
		erdstall: contracts[erdstallContract].address,
		ethHolder: contracts[ethHolderContract].address,
		erc20Holder: contracts[erc20HolderContract].address,
		erc721Holder: contracts[erc721HolderContract].address,
		perun: contracts[perunContract].address,
		op: op,
		tee: tee,
		users: users,
	};
}
