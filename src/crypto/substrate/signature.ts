// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Signature } from "#erdstall/crypto/signature";

export class SubstrateSignature implements Signature<"substrate"> {
	toBytes(): Uint8Array {
		throw new Error("Method not implemented.");
	}
	toString(): string {
		throw new Error("Method not implemented.");
	}

	type(): "substrate" {
		return "substrate";
	}

	static fromJSON(data: any): Signature<"substrate"> {
		throw new Error("Method not implemented.");
	}
	toJSON() {
		throw new Error("Method not implemented.");
	}
	ABIType(): string {
		throw new Error("Method not implemented.");
	}
}
