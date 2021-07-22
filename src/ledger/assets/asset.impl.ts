// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Asset, TypeTags } from "./asset";
import { Amount } from "./amount";
import { Tokens } from "./tokens";

Asset.fromJSON = function (json: any): Asset {
	for (const key in json)
		switch (key) {
			case TypeTags.Tokens:
				return Tokens.fromJSON(json[key]);
			case TypeTags.Amount:
				return Amount.fromJSON(json[key]);
			default:
				throw new Error(
					`Asset.fromJSON: invalid key ${key}, obj=${JSON.stringify(
						json,
					)}`,
				);
		}
	throw new Error(
		`empty object is not a valid Asset encoding: ${JSON.stringify(json)}`,
	);
};
