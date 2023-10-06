// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Backend } from "./backends";
import * as ethereum from "./ethereum/tokentype";
import * as substrate from "./substrate/tokentype";

type TokenTypes = {
	ethereum: ethereum.TokenType;
	substrate: substrate.TokenType;
	test: never;
};

export type TokenType<B extends Backend> = TokenTypes[B];
