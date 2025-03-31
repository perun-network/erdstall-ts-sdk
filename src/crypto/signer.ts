// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Serializable, TypedJSON } from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";
import { Crypto, Address, Signature } from "#erdstall/crypto";

const signatureImpls = new Map<string, Serializable<Signature<Crypto>>>();

export abstract class Signer<B extends Crypto = Crypto> {
	abstract type(): Crypto;
	abstract address(): Address<B>;
	abstract sign(msg: Uint8Array): Promise<Signature<B>>;
}
