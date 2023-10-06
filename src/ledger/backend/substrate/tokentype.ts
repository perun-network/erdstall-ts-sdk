// SPDX-License-Identifier: Apache-2.0
"use strict";

const _tokenTypes = ["SubstrateFungible", "SubstrateNFT"] as const;

export type TokenType = (typeof _tokenTypes)[number];
