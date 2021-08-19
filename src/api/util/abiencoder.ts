// SPDX-License-Identifier: Apache-2.0
"use strict";

import { utils } from "ethers";
import { Address } from "#erdstall/ledger";

export interface ABIEncodable {
	asABI(): any;
}

export class ABIPacked {
	constructor(bytes: Uint8Array | string) {
		this.bytes = utils.arrayify(bytes);
	}

	bytes: Uint8Array;

	keccak256(): Uint8Array {
		return utils.arrayify(utils.keccak256(this.bytes));
	}

	toString(): string {
		return utils.hexlify(this.bytes);
	}
}

export interface ABITaggedPackable {
	packTagged(contract: Address): ABIPacked;
}

export interface ABIValue {
	ABIType(): string;
}

type EncoderArg =
	| ABIValue
	| ABIEncodable
	| ABITaggedPackable
	| [string, any]
	| string
	| Uint8Array
	| boolean;

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
		return this.encodeTagged(undefined, ...fields);
	}

	encodeTagged(contract?: Address, ...fields: EncoderArg[]): this {
		this.types = this.types.concat(
			fields.map((f): string => {
				if ((f as ABITaggedPackable).packTagged !== undefined)
					return "bytes";
				if (f instanceof Array) return f[0];
				else if (f instanceof String || typeof f === "string")
					return "string";
				else if (f instanceof Boolean || typeof f === "boolean")
					return "bool";
				else if ((f as ABIValue).ABIType !== undefined)
					return (f as ABIValue).ABIType();
				else if (f instanceof Uint8Array) return "bytes";
				throw new Error(`cannot encode ${typeof f}`);
			}),
		);
		this.values = this.values.concat(
			fields.map((f): any => {
				if ((f as ABITaggedPackable).packTagged !== undefined)
					return (f as ABITaggedPackable).packTagged(contract!).bytes;
				if ((f as ABIEncodable).asABI !== undefined)
					return (f as ABIEncodable).asABI();

				if (f instanceof String || typeof f === "string") return f;
				if (f instanceof Boolean || typeof f === "boolean") return f;
				if (f instanceof Uint8Array) return f;

				if (f instanceof Array)
					if ((f[1] as ABIEncodable).asABI !== undefined)
						return (f[1] as ABIEncodable).asABI();
					else return f[1];
				throw new Error(`value not encodable ${f}`);
			}),
		);
		return this;
	}

	pack_noprefix(): ABIPacked {
		return new ABIPacked(
			utils.defaultAbiCoder.encode(this.types, this.values),
		);
	}

	pack(tag: string, contract: Address): ABIPacked {
		const enc = new ABIEncoder(tag, contract);
		return new ABIPacked(
			utils.defaultAbiCoder.encode(
				enc.types.concat(this.types),
				enc.values.concat(this.values),
			),
		);
	}
}
