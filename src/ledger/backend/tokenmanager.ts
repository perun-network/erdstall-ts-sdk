// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ethers, Signer } from "ethers";

import { Address } from "../";
import { Asset } from "../assets/asset";
import { TokenType } from "../assets";
import { StageName } from "../../utils";
import {
	makeETHDepositCalls,
	makeERC20DepositCalls,
	makeERC721DepositCalls,
} from "./contracts_deposit";

export type DepositCall = (
	obj?: ethers.PayableOverrides,
) => Promise<ethers.ContractTransaction>;
export type DepositCalls = [StageName, DepositCall][];

export type DepositerCallsFactory = (
	signer: Signer,
	holderAddr: Address,
	tokenAddr: Address,
	amount: Asset,
) => DepositCalls;

export const depositors = new Map<TokenType, DepositerCallsFactory>([
	["ETH", makeETHDepositCalls],
	["ERC20", makeERC20DepositCalls],
	["ERC721", makeERC721DepositCalls],
]);
