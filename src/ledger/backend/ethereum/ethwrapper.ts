// chain_events describe the structure of contract specific events like
// "Deposited", "Withdrawn" etc.
// To stay futureproof, we want to impose our own types instead of exposing the
// typechain generated events types, which are rather cumbersome to use anyway.
"use strict";

import { ethers } from "ethers";
import {
	TypedListener,
	TypedDeferredTopicFilter as TypedEventFilter,
	TypedContractEvent as TypedEvent,
} from "./contracts/common";
import {
	LedgerEvent,
	Chain,
	Frozen,
	Deposited,
	Withdrawn,
	Challenged,
	ChallengeResponded
} from "#erdstall/ledger";
import { Asset, ChainAssets, Amount, Tokens } from "#erdstall/ledger/assets";
import { AssetID } from "#erdstall/crypto";
import { TokenType } from "./tokentype";

import { Erdstall } from "./contracts";
import {
	EthereumAddress,
	EthereumSignature as Signature,
} from "#erdstall/crypto/ethereum";


export function wrapLedgerEvent(
	event: string,
	chain: Chain,
	...data: any
): LedgerEvent|undefined {
	switch(event) {
	case "Frozen":
		return wrapFrozen(chain, ...data);
	case "Deposited":
		return wrapDeposited(chain, ...data);
	case "Withdrawn":
		return wrapWithdrawn(chain, ...data);
	case "Challenged":
		return wrapChallenged(chain, ...data);
	case "ChallengeResponded":
		return wrapChallengeResponded(chain, ...data);
	default:
		console.error("unhandled event type", event, ...data);
	}
}

function wrapFrozen(
	chain: Chain,
	...args: any
): Frozen {
	const [epoch] = args;
	return new Frozen(chain, BigInt(epoch));
}

function wrapDeposited(chain: Chain, ...args: any): Deposited {
	const [epoch, account, tokenValue] = args;
	return new Deposited(
		chain,
		BigInt(epoch),
		EthereumAddress.fromString(account),
		decodePackedAssets([tokenValue]));
}

function wrapWithdrawn(chain: Chain, ...args: any): Withdrawn {
	const [epoch, account, tokenValues] = args;
	return new Withdrawn(
		chain,
		BigInt(epoch),
		EthereumAddress.fromString(account),
		decodePackedAssets(tokenValues));
}

function wrapChallenged(chain: Chain, ...args: any): Challenged
{
	const [epoch, account] = args;
	return new Challenged(
		chain,
		BigInt(epoch),
		EthereumAddress.fromString(account));
}

function wrapChallengeResponded(chain: Chain, ...args: any): ChallengeResponded
{
	const [epoch, account, id, count, tokenValues, exit, sig] = args;
	return new ChallengeResponded(
		chain,
		BigInt(epoch),
		{index: Number(id), count: Number(count)},
		EthereumAddress.fromString(account),
		decodePackedAssets(tokenValues),
		new Signature(ethers.getBytes(sig)),
	);
}

function decodePackedAssetID(packed: Erdstall.AssetStructOutput): AssetID {
	return AssetID.fromMetadata(
		Number(packed.origin) as Chain,
		Number(packed.assetType),
		ethers.getBytes(packed.localID)
	);
}

function decodePackedAssets(
	values: Erdstall.TokenValueStructOutput[],
): ChainAssets {
	const assets = new ChainAssets(new Map());
	for (const { asset, value } of values) {
		const id = decodePackedAssetID(asset);
		assets.addAsset(
			id.origin(),
			id.localID(),
			decodePackedAsset(value, id.type()));
	}
	return assets;
}

export function encodePackedAssets(
	assets: ChainAssets,
): Erdstall.TokenValueStruct[] {
	const values: Erdstall.TokenValueStruct[] = [];
	for(const [ asset, value ] of assets.ordered()) {
		const id: Erdstall.AssetStruct = {
			origin: asset.origin(),
			assetType: asset.type(),
			localID: asset.localID(),
		};
		if(value instanceof Amount)
			values.push({
				asset: id,
				value: [value.value],
			});
		else if(value instanceof Tokens)
			values.push({
				asset: id,
				value: value.value,
			});
		else
			throw new Error(`Unhandled asset type`);
	}
	return values;
}


function decodePackedAsset(data: bigint[], type: number): Asset {
	switch (type) {
	case 0:
		return new Amount(data[0]);
	case 1:
		return new Tokens(data);
	default:
		throw new Error(`decode: unhandled asset type: ${type}`);
	}
}