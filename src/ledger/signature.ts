// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonObject,
	Serializable,
	TypedJSON,
} from "#erdstall/export/typedjson";
import { ABIValue, customJSON } from "#erdstall/api/util";
import { Backend } from "#erdstall/ledger/backend";

const signatureImpls = new Map<string, Serializable<Signature<Backend>>>();

export function registerSignatureType(
	typeName: string,
	typeClass: Serializable<Signature<Backend>>,
) {
	signatureImpls.set(typeName, typeClass);
}

export abstract class Signature<B extends Backend> implements ABIValue {
	abstract asABI(): Uint8Array;

	abstract ABIType(): string;

	abstract toString(): string;

	abstract toJSON(): any;

	abstract type(): B;

	static toJSON(me: Signature<Backend>) {
		return {
			type: me.type(),
			data: me.toJSON(),
		};
	}

	static fromJSON(js: any): Signature<Backend> {
		let data = JSON.stringify(js.data);
		if (!signatureImpls.has(js.type)) {
			throw new Error(`unknown signature type ${js.type}`);
		}

		return TypedJSON.parse(data, signatureImpls.get(js.type)!)!;
	}
}

customJSON(Signature);
