// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { ethers } from "ethers";
import { Wallet } from "ethers";
import { providers } from "ethers";
import { deployContract } from "ethereum-waffle";
import { MockProvider } from "ethereum-waffle";

import {
	Erdstall__factory,
	PerunArt__factory,
} from "#erdstall/ledger/backend/contracts";
import { ETHZERO } from "#erdstall/ledger/assets";

const peruntokenABI = require("../../ledger/backend/contracts/abi/PerunToken.json");
const erdstallABI = require("../../ledger/backend/contracts/abi/Erdstall.json");
const erc20holderABI = require("../../ledger/backend/contracts/abi/ERC20Holder.json");
const erc721holderABI = require("../../ledger/backend/contracts/abi/ERC721Holder.json");
const ethholderABI = require("../../ledger/backend/contracts/abi/ETHHolder.json");
const perunArtABI = require("../../ledger/backend/contracts/abi/PerunArt.json");

export interface Environment {
	provider: providers.Web3Provider;
	perun: string;
	erdstall: string;
	ethHolder: string;
	erc20Holder: string;
	erc721Holder: string;
	perunArt: string;
	op: Wallet;
	tee: Wallet;
	users: Wallet[];
}

const PERUNART_NAME = "PerunArt";
const PERUNART_SYMBOL = "PART";
const PERUNART_URI = "https://nifty.erdstall.dev/";
const PERUN_FUNDS = utils.parseEther("100000").toBigInt();
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
): Promise<Environment> {
	const provider = lprovider ? lprovider : gProvider;

	const op = lop ? lop : wallets[OP];
	const tee = wallets[TEE];
	const users = pacc
		? [pacc]
		: wallets.slice(TEE + 1, TEE + 1 + numOfPrefundedAccounts);

	const perunContract = 0,
		perunArtContract = 1,
		erdstallContract = 2,
		ethHolderContract = 3,
		erc20HolderContract = 4,
		erc721HolderContract = 5;

	const contractDeployments = [
		[peruntokenABI, [users.map((u) => u.address), PERUN_FUNDS]],
		[perunArtABI, [PERUNART_NAME, PERUNART_SYMBOL, PERUNART_URI, []]],
		[erdstallABI, [tee.address, epochDuration]],
	];

	let nonce: number = await op.getTransactionCount();
	let contracts: ethers.Contract[] = [];

	const deployAndStore = async (deployments: typeof contractDeployments) => {
		for (const [abi, args] of deployments) {
			const contract = await deployContract(op, abi, args, {
				nonce: nonce++,
			});
			contracts.push(contract);
		}
	};

	await deployAndStore(contractDeployments);
	const erdstall = Erdstall__factory.connect(
		contracts[erdstallContract].address,
		op,
	);

	const holderDeployments = [
		[ethholderABI, [erdstall.address]],
		[erc20holderABI, [erdstall.address]],
		[erc721holderABI, [erdstall.address]],
	];
	await deployAndStore(holderDeployments);

	const tryRegister = async (
		call: typeof erdstall.registerToken,
		arg1: string,
		arg2: string,
		name: string,
	) => {
		const tx = await call(arg1, arg2, {
			nonce: nonce++,
		});
		const rec = await tx.wait();
		if (!rec.status || rec.status !== 1) {
			Promise.reject(
				new Error(`unable to register ${name} on erdstall contract`),
			);
		}
	};
	const holderRegistration = [
		[contracts[ethHolderContract].address, "ETH"],
		[contracts[erc20HolderContract].address, "ERC20"],
		[contracts[erc721HolderContract].address, "ERC721"],
	];
	for (const [addr, ttype] of holderRegistration) {
		await tryRegister(
			erdstall.registerTokenType,
			addr,
			ttype,
			"token type",
		);
	}

	const tokenRegistration = [
		[ETHZERO, contracts[ethHolderContract].address],
		[
			contracts[perunContract].address,
			contracts[erc20HolderContract].address,
		],
		[
			contracts[perunArtContract].address,
			contracts[erc721HolderContract].address,
		],
	];
	for (const [token, holder] of tokenRegistration) {
		await tryRegister(erdstall.registerToken, token, holder, "tokens");
	}

	// Add every account and ERC721Holder as minter to PerunArt.
	const minters = users
		.map((w) => w.address)
		.concat([
			op.address,
			tee.address,
			contracts[erc721HolderContract].address,
		]);
	const part = PerunArt__factory.connect(
		contracts[perunArtContract].address,
		op,
	);

	for (const addr of minters) {
		await part.addMinter(addr);
	}

	return {
		provider: provider,
		erdstall: contracts[erdstallContract].address,
		ethHolder: contracts[ethHolderContract].address,
		erc20Holder: contracts[erc20HolderContract].address,
		erc721Holder: contracts[erc721HolderContract].address,
		perunArt: contracts[perunArtContract].address,
		perun: contracts[perunContract].address,
		op: op,
		tee: tee,
		users: users,
	};
}
