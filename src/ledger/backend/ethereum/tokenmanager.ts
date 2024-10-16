// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers } from "ethers";

import {
	EthereumAddress as Address,
	EthereumSigner as Signer,
} from "#erdstall/crypto/ethereum";
import { Asset } from "#erdstall/ledger/assets";
import { TokenType } from "./tokentype";
import {
	makeETHDepositCalls,
	makeERC20DepositCalls,
	makeERC721DepositCalls,
} from "./contracts_deposit";
import * as common from "./contracts/common";
import { TransactionName } from "./transactionname";

export type DepositCall = (
	obj?: common.PayableOverrides,
) => Promise<ethers.ContractTransactionResponse>;

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
]);
