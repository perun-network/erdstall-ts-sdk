// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Serializable, TypedJSON } from "#erdstall/export/typedjson";
import { ABIValue, customJSON } from "#erdstall/api/util";
import { Crypto } from "#erdstall/crypto";

const signatureImpls = new Map<string, Serializable<Signature<Crypto>>>();

export function registerSignatureType(
	typeName: string,
	typeClass: Serializable<Signature<Crypto>>,
) {
	signatureImpls.set(typeName, typeClass);
}

export abstract class Signature<B extends Crypto> implements ABIValue {
	abstract asABI(): Uint8Array;

	abstract ABIType(): string;

	abstract toString(): string;

	abstract toJSON(): any;

	abstract toBytes(): Uint8Array;

	abstract type(): B;

	static toJSON(me: Signature<Crypto>) {
		return {
			type: me.type(),
			data: me.toJSON(),
		};
	}

	static fromJSON(js: any): Signature<Crypto> {
		let data = JSON.stringify(js.data);
		if (!signatureImpls.has(js.type)) {
			throw new Error(`unknown signature type ${js.type}`);
		}

		return TypedJSON.parse(data, signatureImpls.get(js.type)!)!;
	}
}

customJSON(Signature);
