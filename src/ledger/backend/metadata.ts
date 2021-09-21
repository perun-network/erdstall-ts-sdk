// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Address } from "#erdstall/ledger";

export interface NFTMetadata {
	image?: string;
	image_data?: string;
	external_url?: string;
	description?: string;
	name?: string;
	background_color?: string;
	animation_url?: string;
	youtube_url?: string;
	attributes?: Attribute[];
}

export const displayTypes = [
	"string",
	"number",
	"boost_percentage",
	"boost_number",
	"date",
] as const;

export type DisplayType = typeof displayTypes[number];

export interface Attribute {
	trait_type: string;
	value: string | number;
	max_value?: number;
	display_type?: DisplayType;
}

export interface NFTMetadataProvider {
	getNftMetadata(token: Address, id: bigint): Promise<NFTMetadata>;
}
