// SPDX-License-Identifier: Apache-2.0
"use strict";

const _tokenTypes = ["ERC20", "ERC721", "ETH"] as const;

export type TokenType = (typeof _tokenTypes)[number];
