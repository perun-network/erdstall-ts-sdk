// SPDX-License-Identifier: Apache-2.0
"use strict";

import PRNG, { newRandomString } from "./random";

import { NFTMetadata, Attribute, displayTypes } from "#erdstall/ledger/backend";

export function newRandomMetadata(rng: PRNG, attributeLimit = 4): NFTMetadata {
	return {
		image: newRandomString(rng, 64),
		image_data: newRandomString(rng, 128),
		external_url: newRandomString(rng, 64),
		description: newRandomString(rng, 256),
		name: newRandomString(rng, 64),
		background_color: newRandomString(rng, 6),
		animation_url: newRandomString(rng, 64),
		youtube_url: newRandomString(rng, 64),
		attributes: newRandomAttributes(rng, attributeLimit),
	};
}

export function newRandomAttributes(
	rng: PRNG,
	upperLimit: number,
): Attribute[] {
	return new Array<number>(rng.uInt32() % upperLimit)
		.fill(0)
		.map(() => newRandomAttribute(rng));
}

export function newRandomAttribute(rng: PRNG): Attribute {
	return {
		trait_type: newRandomString(rng, 64),
		value: rng.uFloat32() > 0.5 ? newRandomString(rng, 32) : rng.uInt32(),
		max_value: rng.uInt32(),
		display_type: displayTypes[rng.uInt32() % displayTypes.length],
	};
}
