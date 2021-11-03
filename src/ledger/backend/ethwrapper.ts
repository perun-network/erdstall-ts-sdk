// chain_events describe the structure of contract specific events like
// "Deposited", "Withdrawn" etc.
// To stay futureproof, we want to impose our own types instead of exposing the
// typechain generated events types, which are rather cumbersome to use anyway.
"use strict";

import { utils } from "ethers";
import { TypedListener, TypedEventFilter } from "./contracts/commons";
import { ErdstallEventHandler } from "#erdstall";
import { Signature } from "#erdstall/api";
import { Address, LedgerEvent } from "#erdstall/ledger";
import { requireTokenType, decodePackedAssets } from "#erdstall/ledger/assets";

import { Erdstall } from "./contracts";
import { TokenProvider } from "./tokencache";

// Listener is used internally by Typechain but is not exposed.
export type Listener = (...args: Array<any>) => void;
export function ethCallbackShim<T extends LedgerEvent>(
	erdstall: Erdstall,
	tokenProvider: Pick<TokenProvider, "tokenTypeOf">,
	ev: T,
	cb: ErdstallEventHandler<typeof ev>,
): Listener;
export function ethCallbackShim(
	erdstall: Erdstall,
	tokenProvider: Pick<TokenProvider, "tokenTypeOf">,
	ev: LedgerEvent,
	cb: ErdstallEventHandler<typeof ev>,
): Listener {
	type EEH<T extends LedgerEvent> = ErdstallEventHandler<T>;
	switch (ev) {
		case "Frozen":
			return wrapFrozen(erdstall, cb as EEH<typeof ev>);
		case "Deposited":
			return wrapDeposited(erdstall, tokenProvider, cb as EEH<typeof ev>);
		case "Withdrawn":
			return wrapWithdrawn(erdstall, tokenProvider, cb as EEH<typeof ev>);
		case "TokenRegistered":
			return wrapTokenRegistered(erdstall, cb as EEH<typeof ev>);
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
	cb: ErdstallEventHandler<"Frozen">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Frozen>;
	const wcb: TypedListener<tp[0], tp[1]> = async (epoch) => {
		return cb({ epoch: epoch.toBigInt() });
	};
	return wcb;
}

function wrapDeposited(
	erdstall: Erdstall,
	tokenProvider: Pick<TokenProvider, "tokenTypeOf">,
	cb: ErdstallEventHandler<"Deposited">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Deposited>;
	const wcb: TypedListener<tp[0], tp[1]> = async (
		epoch,
		account,
		token,
		value,
	) => {
		const assets = await decodePackedAssets(erdstall, tokenProvider, [
			[token, value],
		]);
		return cb({
			epoch: epoch.toBigInt(),
			address: Address.fromString(account),
			assets: assets,
		});
	};
	return wcb;
}

function wrapWithdrawn(
	erdstall: Erdstall,
	tokenProvider: Pick<TokenProvider, "tokenTypeOf">,
	cb: ErdstallEventHandler<"Withdrawn">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Withdrawn>;
	const wcb: TypedListener<tp[0], tp[1]> = async (epoch, account, values) => {
		const assets = await decodePackedAssets(
			erdstall,
			tokenProvider,
			values,
		);
		return cb({
			epoch: epoch.toBigInt(),
			address: Address.fromString(account),
			tokens: assets,
		});
	};
	return wcb;
}

function wrapTokenRegistered(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"TokenRegistered">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.TokenRegistered>;
	const wcb: TypedListener<tp[0], tp[1]> = async (
		token,
		tokenType,
		tokenHolder,
	) => {
		return cb({
			token: Address.fromString(token),
			tokenHolder: Address.fromString(tokenHolder),
			tokenType: requireTokenType(tokenType),
		});
	};
	return wcb;
}

function wrapTokenTypeRegistered(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"TokenTypeRegistered">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.TokenTypeRegistered>;
	const wcb: TypedListener<tp[0], tp[1]> = async (tokenType, tokenHolder) => {
		return cb({
			tokenHolder: Address.fromString(tokenHolder),
			// TODO: How do we cope with newly registered tokentypes?
			tokenType: tokenType as any,
		});
	};
	return wcb;
}

function wrapChallenged(
	erdstall: Erdstall,
	cb: ErdstallEventHandler<"Challenged">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.Challenged>;
	const wcb: TypedListener<tp[0], tp[1]> = async (epoch, account) => {
		return cb({
			epoch: epoch.toBigInt(),
			address: Address.fromString(account),
		});
	};
	return wcb;
}

function wrapChallengeResponded(
	erdstall: Erdstall,
	tokenProvider: Pick<TokenProvider, "tokenTypeOf">,
	cb: ErdstallEventHandler<"ChallengeResponded">,
): Listener {
	type tp = InstanceTypes<typeof erdstall.filters.ChallengeResponded>;
	const wcb: TypedListener<tp[0], tp[1]> = async (
		epoch,
		account,
		tokens,
		sig,
	) => {
		const assets = await decodePackedAssets(
			erdstall,
			tokenProvider,
			tokens,
		);
		return cb({
			epoch: epoch.toBigInt(),
			address: Address.fromString(account),
			tokens: assets,
			sig: new Signature(sig),
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
type PolymorphicTypeParameters<T> = T extends TypedEventFilter<infer X, infer Y>
	? [X, Y]
	: never;

// Compose both operations to retrieve the necessary types from a
// `TypedEventFilter`.
type InstanceTypes<T extends (...args: any) => any> = PolymorphicTypeParameters<
	ReturnType<T>
>;
