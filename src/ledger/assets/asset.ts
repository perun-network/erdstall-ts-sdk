// SPDX-License-Identifier: Apache-2.0
"use strict";

export const TypeTags = {
	Amount: "uint",
	Tokens: "idset",
};

export abstract class Asset {
	abstract toJSON(): any;
	static fromJSON: (json: any) => Asset;
	abstract typeTag(): string;
}
