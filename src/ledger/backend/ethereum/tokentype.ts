// SPDX-License-Identifier: Apache-2.0
"use strict";

const _tokenTypes = ["ETH", "ERC20", "ERC721"] as const;

export type TokenType = (typeof _tokenTypes)[number];
