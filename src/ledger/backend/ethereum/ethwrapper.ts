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
import { LedgerEvent } from "#erdstall/ledger";
import { decodePackedAssets } from "#erdstall/ledger/assets";

import { Erdstall } from "./contracts";
import { TokenProvider } from "#erdstall/ledger/backend/tokenprovider";
import {
	EthereumAddress,
	EthereumSignature as Signature,
} from "#erdstall/crypto/ethereum";

// Listener is used internally by Typechain but is not exposed.
export type Listener = (...args: Array<any>) => void;
export function ethCallbackShim<T extends LedgerEvent>(
	erdstall: Erdstall,
	tokenProvider: Pick<TokenProvider<"ethereum">, "tokenTypeOf">,
	ev: T,
	cb: ErdstallEventHandler<typeof ev, "ethereum">,
): Listener;
export function ethCallbackShim(
	erdstall: Erdstall,
	tokenProvider: Pick<TokenProvider<"ethereum">, "tokenTypeOf">,
	ev: LedgerEvent,
	cb: ErdstallEventHandler<typeof ev, "ethereum">,
): Listener {
	type EEH<T extends LedgerEvent> = ErdstallEventHandler<T, "ethereum">;
	switch (ev) {
		case "Frozen":
			return wrapFrozen(erdstall, cb as EEH<typeof ev>);
		case "Deposited":
			return wrapDeposited(erdstall, tokenProvider, cb as EEH<typeof ev>);
		case "Withdrawn":
			return wrapWithdrawn(erdstall, tokenProvider, cb as EEH<typeof ev>);
		case "TokenTypeRegistered":
			return wrapTokenTypeRegistered(erdstall, cb as EEH<typeof ev>);
		case "Challenged":
			return wrapChallenged(erdstall, cb as EEH<typeof ev>);
		case "ChallengeResponded":
			return wrapChallengeResponded(
				erdstall,
				tokenProvider,
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
	tokenProvider: Pick<TokenProvider<"ethereum">, "tokenTypeOf">,
	cb: ErdstallEventHandler<"Deposited", "ethereum">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Deposited>;
	const wcb: TypedListener<TypedEvent<tp[0], tp[1]>> = async (
		epoch,
		account,
		tokenValue,
	) => {
		const assets = await decodePackedAssets(erdstall, tokenProvider, [
			tokenValue,
		]);
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
	tokenProvider: Pick<TokenProvider<"ethereum">, "tokenTypeOf">,
	cb: ErdstallEventHandler<"Withdrawn", "ethereum">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Withdrawn>;
	const wcb: TypedListener<TypedEvent<tp[0], tp[1]>> = async (
		epoch,
		account,
		tokenValues,
	) => {
		const assets = await decodePackedAssets(
			erdstall,
			tokenProvider,
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
			// TODO: How do we cope with newly registered tokentypes?
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
	tokenProvider: Pick<TokenProvider<"ethereum">, "tokenTypeOf">,
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
		const assets = await decodePackedAssets(
			erdstall,
			tokenProvider,
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
