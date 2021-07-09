// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { Address } from "../../ledger";

export interface ABIEncodable {
	asABI(): any;
}

export interface ABIValue extends ABIEncodable {
	ABIType(): string;
}

type EncoderArg = ABIValue | [string, any] | string | boolean;

/** ABIEncoder encodes values into the Ethereum ABI.
	It supports values as either `[string, value]` pairs, or as `ABIValue`. A
	value either needs to be converted into the correct type for encoding, or
	fulfill the `ABIEncodable` interface. */
export class ABIEncoder {
	private types: string[];
	private values: any[];

	constructor(...fields: EncoderArg[]) {
		this.types = [];
		this.values = [];
		this.encode(...fields);
	}

	encode(...fields: EncoderArg[]): this {
		this.types = this.types.concat(
			fields.map((f): string => {
				if (f instanceof Array) return f[0];
				else if (f instanceof String || typeof f === "string")
					return "string";
				else if (f instanceof Boolean || typeof f === "boolean")
					return "bool";
				else if ((f as ABIValue).ABIType !== undefined)
					return (f as ABIValue).ABIType();
				throw new Error(`cannot encode ${typeof f}`);
			}),
		);
		this.values = this.values.concat(
			fields.map((f): any => {
				if ((f as ABIEncodable).asABI !== undefined)
					return (f as ABIEncodable).asABI();
				if (
					f instanceof String ||
					typeof f === "string" ||
					f instanceof Boolean ||
					typeof f === "boolean"
				)
					return f;
				if (f instanceof Array)
					if ((f[1] as ABIEncodable).asABI !== undefined)
						return (f[1] as ABIEncodable).asABI();
					else return f[1];
				throw new Error(`value not encodable ${f}`);
			}),
		);
		return this;
	}

	pack_noprefix(): any {
		return utils.defaultAbiCoder.encode(this.types, this.values);
	}

	pack(tag: string, contract: Address): any {
		const enc = new ABIEncoder(tag, contract);
		return utils.defaultAbiCoder.encode(
			enc.types.concat(this.types),
			enc.values.concat(this.values),
		);
	}
}
