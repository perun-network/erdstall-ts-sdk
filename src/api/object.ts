// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	Serializable,
	jsonObject,
} from "#erdstall/export/typedjson";
import { customJSON } from "./util";
import { CodecReader, CodecWriter } from "#erdstall/utils";

const objectImpls = new Map<string, Serializable<ErdstallObject> & Decoder>();

interface Decoder {
	decode(r: CodecReader): ErdstallObject;
}

export function registerErdstallType(
	typeName: string,
	typeClass: Serializable<ErdstallObject> & Decoder,
) {
	objectImpls.set(typeName, typeClass);
}

/** Base type for all Erdstall messages. */
@jsonObject
export abstract class ErdstallObject {
	public abstract objectType(): Serializable<ErdstallObject> & Decoder;
	public abstract objectTypeName(): string;

	static fromJSON(js: any): ErdstallObject {
		let desc = objectImpls.get(js.type);
		if (!desc) throw new Error(`unknown erdstall object type "${js.type}"`);
		if (js.type === "ClientConfig") {
			// Not a good implementation, but a functional one.
			return (desc as any).fromJSON(js.data);
		} else {
			if (typeof js.data !== "string")
				throw new Error(`expected string payload in ${js.type} json`);

			return desc.decode(CodecReader.fromString(js.data));
		}
	}

	static toJSON(me: ErdstallObject): any {
		const w = new CodecWriter();
		me.encode(w);
		return {
			type: me.objectTypeName(),
			data: w.getAsString(),
		};
	}

	abstract encode(w: CodecWriter): void;
}

customJSON(ErdstallObject);
