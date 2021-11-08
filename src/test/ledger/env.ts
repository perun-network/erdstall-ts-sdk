// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { ethers } from "ethers";
import { Wallet } from "ethers";
import { providers } from "ethers";
import { deployContract, MockProvider } from "ethereum-waffle";
import {
	Erdstall__factory,
	PerunArt__factory,
} from "#erdstall/ledger/backend/contracts";
import { ETHZERO } from "#erdstall/ledger/assets";

import peruntokenABI from "../../ledger/backend/contracts/abi/PerunToken.json";
import erdstallABI from "../../ledger/backend/contracts/abi/Erdstall.json";
import erc20holderABI from "../../ledger/backend/contracts/abi/ERC20Holder.json";
import erc721holderABI from "../../ledger/backend/contracts/abi/ERC721Holder.json";
import ethholderABI from "../../ledger/backend/contracts/abi/ETHHolder.json";
import perunArtABI from "../../ledger/backend/contracts/abi/PerunArt.json";

// ethereum-waffle does not expose this type...
type _params = ConstructorParameters<typeof MockProvider>;
export type MockProviderOptions = NonNullable<_params[0]>["ganacheOptions"];

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
	mine: (numBlocks?: number | bigint) => Promise<void>;
	currentEpoch: () => Promise<bigint>;
	sealEpoch: (ep: bigint) => Promise<bigint>;
}

const PERUNART_NAME = "PerunArt";
const PERUNART_SYMBOL = "PART";
export const PERUNART_URI = "https://nifty.erdstall.dev/";
const PERUN_FUNDS = utils.parseEther("100000").toBigInt();
const OP = 0,
	TEE = 1;

export async function setupEnv(
	numOfPrefundedAccounts: number = 1,
	epochDuration: number = 3,
	ganacheOptions?: MockProviderOptions,
): Promise<Environment> {
	if (epochDuration <= 0) {
		throw new Error("epochDuration must not be negative or zero");
	}

	const provider = new MockProvider(
		ganacheOptions ? { ganacheOptions: ganacheOptions } : undefined,
	);

	const mineBlocks = async (n: number | bigint = 1) => {
		for (let i = 0; i < n; i++) {
			await provider.send("evm_mine", []);
		}
	};

	const wallets = provider.getWallets();

	const op = wallets[OP];
	const tee = wallets[TEE];
	const users = wallets.slice(TEE + 1, TEE + 1 + numOfPrefundedAccounts);

	const perunContract = 0,
		perunArtContract = 1,
		erdstallContract = 2,
		ethHolderContract = 3,
		erc20HolderContract = 4,
		erc721HolderContract = 5;

	const contractDeployments = [
		[peruntokenABI as any, [users.map((u) => u.address), PERUN_FUNDS]],
		[
			perunArtABI as any,
			[PERUNART_NAME, PERUNART_SYMBOL, PERUNART_URI, []],
		],
		[erdstallABI as any, [tee.address, epochDuration]],
	];

	let nonce: number = await op.getTransactionCount();
	let contracts: ethers.Contract[] = [];

	const deployAndStore = async (deployments: typeof contractDeployments) => {
		for (const [abi, args] of deployments) {
			const contract = deployContract(op, abi, args, {
				nonce: nonce++,
			});
			await mineBlocks(8);
			contracts.push(await contract);
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
		await mineBlocks();
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

	nonce = await op.getTransactionCount();
	for (const addr of minters) {
		await part.addMinter(addr, { nonce: nonce++ });
	}
	await mineBlocks();

	const currentEpoch = async (): Promise<bigint> => {
		return Promise.all([
			erdstall.bigBang(),
			provider.getBlockNumber(),
		]).then(([bigbang, currentBlock]) => {
			return (
				(BigInt(currentBlock) - bigbang.toBigInt()) /
				BigInt(epochDuration)
			);
		});
	};

	const sealEpoch = async (epoch: bigint): Promise<bigint> => {
		const bInit = await erdstall.bigBang();
		const targetEpoch = epoch + 2n; // an epoch is sealed on-chain if the current block is two epochs further
		const targetBlock =
			bInit.toBigInt() + targetEpoch * BigInt(epochDuration);
		const currentBlock = BigInt(await provider.getBlockNumber());
		const bdelta = targetBlock - currentBlock;
		if (bdelta <= -epochDuration)
			throw new Error(
				`Sealed epoch ${targetEpoch} already passed, current: ${
					(BigInt(currentBlock) - bInit.toBigInt()) /
					BigInt(epochDuration)
				}`,
			);
		if (bdelta <= 0) {
			console.log(`Current sealed epoch already at ${targetEpoch}`);
			return bdelta;
		}
		await mineBlocks(bdelta);
		return bdelta;
	};

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
		mine: mineBlocks,
		currentEpoch: currentEpoch,
		sealEpoch: sealEpoch,
	};
}
