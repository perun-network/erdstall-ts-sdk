// chain_events describe the structure of contract specific events like
// "Deposited", "Withdrawn" etc.
// To stay futureproof, we want to impose our own types instead of exposing the
// typechain generated events types, which are rather cumbersome to use anyway.
"use strict";

import { utils } from "ethers";
import {
	TypedListener,
	TypedEventFilter,
	TypedEvent,
} from "./contracts/common";
import { ErdstallEventHandler } from "#erdstall";
import { LedgerEvent, Chain } from "#erdstall/ledger";
import { Asset, ChainAssets, Amount, Tokens } from "#erdstall/ledger/assets";
import { AssetID } from "#erdstall/crypto";
import { TokenType } from "./tokentype";

import { mkBigInt } from "#erdstall/utils/bigint";

import { Erdstall } from "./contracts";
import {
	EthereumAddress,
	EthereumSignature as Signature,
} from "#erdstall/crypto/ethereum";

// Listener is used internally by Typechain but is not exposed.
export type Listener = (...args: Array<any>) => void;
export function ethCallbackShim<T extends LedgerEvent>(
	erdstall: Erdstall,
	ev: T,
	cb: ErdstallEventHandler<typeof ev, "ethereum">,
): Listener;
export function ethCallbackShim(
	erdstall: Erdstall,
	ev: LedgerEvent,
	cb: ErdstallEventHandler<typeof ev, "ethereum">,
): Listener {
	type EEH<T extends LedgerEvent> = ErdstallEventHandler<T, "ethereum">;
	switch (ev) {
		case "Frozen":
			return wrapFrozen(erdstall, cb as EEH<typeof ev>);
		case "Deposited":
			return wrapDeposited(erdstall, cb as EEH<typeof ev>);
		case "Withdrawn":
			return wrapWithdrawn(erdstall, cb as EEH<typeof ev>);
		case "TokenTypeRegistered":
			return wrapTokenTypeRegistered(erdstall, cb as EEH<typeof ev>);
		case "Challenged":
			return wrapChallenged(erdstall, cb as EEH<typeof ev>);
		case "ChallengeResponded":
			return wrapChallengeResponded(
				erdstall,
				cb as EEH<typeof ev>,
			);
	}
}

function wrapFrozen(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"Frozen", "ethereum">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Frozen>;
	const wcb: TypedListener<TypedEvent<tp[0], tp[1]>> = async (epoch) => {
		return cb({ source: "ethereum", epoch: epoch.toBigInt() });
	};
	return wcb;
}

function wrapDeposited(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"Deposited", "ethereum">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Deposited>;
	const wcb: TypedListener<TypedEvent<tp[0], tp[1]>> = async (
		epoch,
		account,
		tokenValue,
	) => {
		const assets = decodePackedAssets(erdstall, [tokenValue]);
		return cb({
			source: "ethereum",
			epoch: epoch.toBigInt(),
			address: EthereumAddress.fromString(account),
			assets: assets,
		});
	};
	return wcb;
}

function wrapWithdrawn(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"Withdrawn", "ethereum">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Withdrawn>;
	const wcb: TypedListener<TypedEvent<tp[0], tp[1]>> = async (
		epoch,
		account,
		tokenValues,
	) => {
		const assets = decodePackedAssets(
			erdstall,
			tokenValues,
		);
		return cb({
			source: "ethereum",
			epoch: epoch.toBigInt(),
			address: EthereumAddress.fromString(account),
			tokens: assets,
		});
	};
	return wcb;
}

function wrapTokenTypeRegistered(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"TokenTypeRegistered", "ethereum">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.TokenTypeRegistered>;
	const wcb: TypedListener<TypedEvent<tp[0], tp[1]>> = async (
		tokenType,
		tokenHolder,
	) => {
		return cb({
			source: "ethereum",
			tokenHolder: EthereumAddress.fromString(tokenHolder),
			tokenType: tokenType as any,
		});
	};
	return wcb;
}

function wrapChallenged(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"Challenged", "ethereum">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Challenged>;
	const wcb: TypedListener<TypedEvent<tp[0], tp[1]>> = async (
		epoch,
		account,
	) => {
		return cb({
			source: "ethereum",
			epoch: epoch.toBigInt(),
			address: EthereumAddress.fromString(account),
		});
	};
	return wcb;
}

function wrapChallengeResponded(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"ChallengeResponded", "ethereum">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.ChallengeResponded>;
	const wcb: TypedListener<TypedEvent<tp[0], tp[1]>> = async (
		epoch,
		account,
		id,
		count,
		tokenValues,
		exit,
		sig,
	) => {
		const assets = decodePackedAssets(
			erdstall,
			tokenValues,
		);
		const address = EthereumAddress.fromString(account);
		const sigBytes = utils.arrayify(sig);
		return cb({
			source: "ethereum",
			epoch: epoch.toBigInt(),
			address: address,
			tokens: assets,
			sig: new Signature(sigBytes),
		});
	};
	return wcb;
}


function decodePackedAssetID(packed: Erdstall.AssetStructOutput): AssetID {
	return AssetID.fromMetadata(
		packed.origin as Chain,
		packed.assetType,
		utils.arrayify(packed.localID)
	);
}

function decodePackedAssets(
	erdstall: Erdstall,
	values: Erdstall.TokenValueStructOutput[],
): ChainAssets {
	const assets = new ChainAssets(new Map());
	for (const { asset, value } of values) {
		const id = decodePackedAssetID(asset);
		assets.addAsset(
			id.origin(),
			id.localID(),
			decodePackedAsset(
				value.map(x => x.toBigInt()), id.type()));
	}
	return assets;
}

export function packAmount(amount: Amount): bigint {
	return amount.value;
}

export function packTokens(tokens: Tokens): bigint[] {
	return tokens.value.map((v) => packAmount(new Amount(v)));
}

export function encodePackedIds(ids: bigint[]): string {
	return utils.hexlify(utils.concat(ids.map(id => utils.defaultAbiCoder.encode(["uint256"], [id]))));
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

// Typechain forces us to parse the polymorphic type arguments for the
// `TypedListener` callback from the `TypedEventFilter`. The specific
// interfaces and arrays containing types are not exposed. To keep this
// futureproof we retrieve the necessary polymorphic type parameters from the
// concrete `TypedEventFilter` instantiations.

// Infer the concrete typeparameters for a given concrete `TypedEventFilter`
// and return them as a tuple type [X, Y].
type PolymorphicTypeParameters<T> = T extends TypedEventFilter<
	TypedEvent<infer X, infer Y>
>
	? [X, Y]
	: never;

// Compose both operations to retrieve the necessary types from a
// `TypedEventFilter`.
type InstanceTypes<T extends (...args: any) => any> = PolymorphicTypeParameters<
	ReturnType<T>
>;
