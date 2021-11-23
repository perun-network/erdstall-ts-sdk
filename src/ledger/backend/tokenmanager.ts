// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";

import { Address } from "#erdstall/ledger";
import { Asset } from "#erdstall/ledger/assets";
import { TokenType } from "#erdstall/ledger/assets";
import { TransactionName } from "#erdstall/utils";
import {
	makeETHDepositCalls,
	makeERC20DepositCalls,
	makeERC721DepositCalls,
} from "./contracts_deposit";

export type DepositCall = (
	obj?: ethers.PayableOverrides,
) => Promise<ethers.ContractTransaction>;
export type Calls = [TransactionName, DepositCall][];

export type DepositerCallsFactory = (
	signer: Signer,
	holderAddr: Address,
	tokenAddr: Address,
	amount: Asset,
) => Calls;

export const depositors = new Map<TokenType, DepositerCallsFactory>([
	["ETH", makeETHDepositCalls],
	["ERC20", makeERC20DepositCalls],
	["ERC721", makeERC721DepositCalls],
	["ERC721Mintable", makeERC721DepositCalls],
]);
