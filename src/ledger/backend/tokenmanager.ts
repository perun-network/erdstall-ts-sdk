// SPDX-License-Identifier: Apache-2.0
"use strict";

// TokenTypes supported by Erdstall. Currently only "fungible" and "NFT" are
// supported. If any special token types are added to Erdstall, they will have
// to be added here.
type TokenTypes = ["Fungible", "NFT"];

// Each backend has a mapping from generic token types to specific counterparts
// on their respective chain. E.g. Ethereum has the native asset "ETH" and all
// ERC20 tokens mapped as "Fungible" tokens. "NFT" tokens are mapped to ERC721.
// Substrate on the other hand maps "Fungible" and "NFT" tokens to the Erdstall
// pallet, since that handles all specifics.

type EthereumMapping = [["Fungible", ["ETH", "ERC20"]], ["NFT", ["ERC721"]]];

// NOTE CLEANUP: do we need this?
type SubstrateMapping = [["Fungible", ["PALLET"], ["NFT", ["PALLET"]]]];
