// SPDX-License-Identifier: Apache-2.0
"use strict";

// This file specifies backend specific types regarding ledger transactions.
// This includes general transactions and some Erdstall specific wrappers.

// Currently TokenTypes:
// NFT
// Fungibles
//
// Each chain could have multiple holders for the same tokentype.
//	=> Ethereum has for Fungibles:
//			ERC20HolderContract
//			ETHHolderContract
//
//			TokenTypeRegistered event gives localID
//				:=> lookup localID in backend contract code to resolve tokentype
