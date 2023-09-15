// SPDX-License-Identifier: Apache-2.0
"use strict";

// This file contains the Erdstall implementation, unifying the on-chain and
// offchain part of Erdstall into a single interface.

import { PendingTransaction } from "#erdstall/api/util/pending_transaction";
import { TradeOffer } from "#erdstall/api/transactions";
import { BalanceProof, AttestationResult } from "#erdstall/api/responses";
import { Address, Account, LedgerEvent } from "#erdstall/ledger";
import { Backend, RequestedBackends } from "#erdstall/ledger/backend";
import { ChainAssets } from "#erdstall/ledger/assets";
import { Uint256 } from "#erdstall/api/util";
import { TransactionGenerator } from "#erdstall/utils";
import { EnclaveEvent } from "#erdstall/enclave";
import { NFTMetadataProvider } from "#erdstall/ledger/backend";
import { ErdstallEvent, ErdstallEventHandler } from "./event";
export * from "./client";
export * from "./session";

/**
 * Describes the ability to watch out/listen for certain events.
 *
 * @typeParam T - Type of events to watch out/listen for.
 */
interface watcher<T extends ErdstallEvent, Bs extends Backend[][number]> {
	/**
	 * Registers a callback for the given event, s.t. it fires everytime until
	 * manually unregistered with `off(ev, cb)`.
	 *
	 * @typeParam EV - Type of event the callback is parameterized on.
	 *
	 * @param ev - The event of interest.
	 * @param cb - The callback depending on the type of ev.
	 *
	 * @remarks
	 * The registered callback should always be manually unregistered.
	 */
	on: <EV extends T>(ev: EV, cb: ErdstallEventHandler<EV, Bs>) => void;

	/**
	 * Registers a callback for the given event, s.t. it fires only ONCE.
	 * Once registered, a callback cannot be unregistered again.
	 *
	 * @typeParam EV - Type of event the callback is parameterized on.
	 *
	 * @param ev - The event of interest.
	 * @param cb - The callback depending on the type of ev.
	 */
	once: <EV extends T>(ev: EV, cb: ErdstallEventHandler<EV, Bs>) => void;

	/**
	 * Unregisters a callback for the given event.
	 *
	 * @typeParam EV - Type of event the callback is parameterized on.
	 *
	 * @param ev - The event of interest.
	 * @param cb - The callback depending on the type of ev.
	 */
	off: <EV extends T>(ev: EV, cb: ErdstallEventHandler<EV, Bs>) => void;

	/**
	 * Removes all registered callbacks for all events.
	 */
	removeAllListeners: () => void;
}

/**
 * Watcher only for LedgerEvents.
 */
export interface ErdstallWatcher<Bs extends Backend[]>
	extends watcher<LedgerEvent, Bs[number]> {}

/**
 * Watcher only for EnclaveEvents.
 */
export interface EnclaveWatcher
	extends watcher<EnclaveEvent, never>,
		Subscriber {}

/**
 * Watcher for LedgerEvents and EnclaveEvents.
 */
export interface Watcher<Bs extends Backend[]>
	extends watcher<ErdstallEvent, Bs[number]> {}

/**
 * Describes an entity within Erdstall with the ability to return the erdstall
 * contracts onchain address.
 */
export interface Contracter<Bs extends Backend[]> {
	/**
	 * @returns The address of the onchain erdstall contract for each supported
	 * backend.
	 */
	erdstall(): Bs extends [infer BID]
		? // TODO: The `Address<Backend>` should really be `Address<BID>`.
		  { chain: BID; address: Address<Backend> }
		: { chain: Bs[number]; address: Address<Bs[number]> }[];
}

/**
 * Describes an entity with the ability to transfer its own asset to another
 * address.
 */
export interface Transactor {
	/**
	 * Transfers the given assets to the specified address.
	 *
	 * @param assets - The assets to transfer.
	 * @param to - The recipient of this transfer action.
	 * @returns A promise containing the pending transaction for this transfer.
	 */
	transferTo(
		assets: ChainAssets,
		to: Address<Backend>,
	): Promise<PendingTransaction>;
}

/**
 * Describes an entity with the ability to mint a token.
 */
export interface Minter {
	/**
	 * Mints a token for the given token address and corresponding id.
	 *
	 * @param token - The address of the token contract the token is part of.
	 * @param id - The id of the token within the specified token contract.
	 * @returns A promise containing the pending transaction for this mint.
	 */
	mint(token: Uint8Array, id: Uint256): Promise<PendingTransaction>;
}

/**
 * Describes an entity with the ability to burn assets.
 */
export interface Burner {
	/**
	 * Unrecoverably burns the specified assets.
	 *
	 * @param assets - The assets to be burned by this transaction.
	 * @returns A promise containing the pending transaction for this burn.
	 */
	burn(assets: ChainAssets): Promise<PendingTransaction>;
}

/**
 * Describes an entity with the ability to create and accept trade offers.
 */
export interface Trader {
	/**
	 * Creates a signed trade offer.
	 *
	 * @param offer - The assets which are being offered.
	 * @param expect - The assets which are expected in return.
	 * @returns A promise containing the assembled and signed trade offer.
	 */
	createOffer(offer: ChainAssets, expect: ChainAssets): Promise<TradeOffer>;

	/**
	 * Accepts the given trade offer and submits this trade to Erdstall.
	 *
	 * @param offer - The trade offer to be accepted by this entity.
	 */
	acceptTrade(offer: TradeOffer): Promise<PendingTransaction>;
}

/**
 * Describes an entity with the ability to deposit funds in Erdstall.
 */
export interface Depositor<Bs extends Backend[]> {
	/**
	 * Deposits the specified assets in Erdstall. This is interacting with the
	 * erdstall entity on the ledger.
	 *
	 * @param assets - The assets to be deposited.
	 * @returns A promise containing the stages of onchain transactions.
	 *
	 * @remarks
	 * Depositing is a multi-step process takes a different number of steps for
	 * each type of asset contained in the `assets` object passed to this
	 * function. For more information about stages look at the corresponding
	 * documentation.
	 */
	deposit(
		backend: RequestedBackends<Bs>,
		assets: ChainAssets,
	): Promise<TransactionGenerator>;
}

/**
 * Describes an entity with the ability to withdraw funds from Erdstall.
 */
export interface Withdrawer<Bs extends Backend[]> {
	/**
	 * Withdraws funds by using the given balance proof. The assets contained
	 * within the balanceproof will be available onchain when done. This proof
	 * has to be signed by the TEE running Erdstall and have its exit flag set.
	 * The exit proof can be retrieved by calling `Exiter.exit()` and using its
	 * result.
	 *
	 * @param exitProof - Signed balance proof with the exit flag set.
	 * @returns A promise containing the stages of onchain transactions.
	 *
	 * @remarks
	 * Withdrawing is a multistep process which might contain different amount of
	 * steps for each type of asset contained in the balance proof.
	 */
	withdraw(
		backend: RequestedBackends<Bs>,
		exitProof: BalanceProof,
	): Promise<TransactionGenerator>;
}

/**
 * Describes an entity with the ability to signal the desire to exit from
 * Erdstall.
 */
export interface Exiter {
	/**
	 * Exits Erdstall.
	 *
	 * @returns A promise containing the exit proof signed by the TEE running
	 * Erdtall.
	 *
	 * @remarks
	 * **Unless** more control over the leave protocol is required it is advised
	 * to use `Leaver.leave` over the individual `Exiter.exit` call, because the
	 * latter has to be manually followed by a call to `Withdrawer.withdraw`.
	 */
	exit(): Promise<BalanceProof>;
}

/**
 * Describes an entity with the ability to exit AND withdraw funds from
 * Erdstall.
 */
export interface Leaver<Bs extends Backend[]> extends Exiter, Withdrawer<Bs> {
	/**
	 * Leaves Erdstall by first exiting and then withdrawing available funds.
	 *
	 * @returns A promise containing the stages of onchain transactions.
	 *
	 * @remarks
	 * Check out the documentation for `Withdrawer.withdraw` and `Stages` for
	 * more information about theh return type.
	 */
	leave<B extends RequestedBackends<Bs>>(
		backend: B,
		notify?: (message: string, stage: number, maxStages: number) => void,
	): Promise<TransactionGenerator>;
}

/**
 * Describes an entity with the ability to subscribe to itself within Erdstall.
 * This has the effect that every TxReceipt and BalanceProof concerning this
 * entity is also contained in the appropriate events for which callback
 * handlers were specified.
 */
export interface SelfSubscriber {
	/**
	 * Subscribes the entity to its own address in Erdstall.
	 */
	subscribeSelf(): Promise<void>;
}

/**
 * Describes an entity with the ability to subscribe to TxReceipts and
 * BalanceProofs concerning either all or a specific address within Erdstall.
 */
export interface Subscriber {
	/**
	 * Subscribes the entity to receive TxReceipts and BalanceProofs concerning
	 * either all or the specified address.
	 *
	 * Handlers for incoming messages can be set using `on` and `once`.
	 *
	 * @param who - When omitted subscribes to ALL available BalanceProofs and
	 * TxReceipts.
	 * @returns An empty promise which can be awaited.
	 */
	subscribe(who?: Address<Backend>): Promise<void>;
}

/**
 * Describes an entity with the ability to retrieve its current account state
 * within Erdstall.
 */
export interface OwnAccountGetter {
	/**
	 * Retrieves the current account state of this entity within Erdtall.
	 *
	 * @returns A promise containing the state of the account.
	 */
	getOwnAccount(): Promise<Account>;
}

/**
 * Describes an entity with the ability to retrieve the account state of any
 * address.
 */
export interface AccountGetter {
	/**
	 * Retrieves the current account state of the specified address.
	 *
	 * @returns A promise containing the current account state of the specified
	 * address.
	 */
	getAccount(who: Address<Backend>): Promise<Account>;
}

export interface Attester {
	/**
	 * Queries the enclave's remote attestation.
	 * @returns A promise to the enclave's remote attestation.
	 * @throws An error if the attestation was not generated by the enclave yet.
	 */
	attest(): Promise<AttestationResult>;
}

/**
 * Describes an entity with the ability to enter Erdstall.
 */
export interface Onboarder {
	/**
	 * Enters Erdstall by sending an `Onboarding` message to the operator, which
	 * lets it know about the presence of this entity within Erdstall.
	 */
	onboard(): Promise<void>;
}

/**
 * Describes an entity which has to do some initialization before being used.
 */
export interface Initializer<_Bs extends Backend[]> {
	/**
	 * Initalizes the entity. When coupled with a `Subscriber` see the remarks
	 * section.
	 *
	 * @remarks
	 * This function has to be called before any subscribe calls can be made.
	 * However, the Watcher calls should be made before this function is called,
	 * if appropriate, to prevent events being missed.
	 * E.g., call `on`/`once`, then `initialize` and then `subscribe`.
	 */
	initialize(): Promise<void>;
}

/**
 * Describes a passive client which can observe Erdstall and its state but is
 * incapable of taking any actions.
 */
export interface ErdstallClient<Bs extends Backend[]>
	// The type-level list tracks the supported backends at compile time.
	extends Watcher<Bs>,
		Contracter<Bs>,
		Initializer<Bs>,
		Subscriber,
		NFTMetadataProvider<Bs>,
		AccountGetter,
		Attester,
		Contracter<Bs>,
		NFTMetadataProvider<Bs> {
	/**
	 * Provider allowing to query token information related to Erdstall and
	 * its onchain contracts.
	 */
	// readonly tokenProvider: TokenProvider<Backend>;
	// readonly onChainQuerier: OnChainQuerier<Bs>;
}

/**
 * Generic ErdstallBackendClient responsible for communicating with ledger
 * specific components. It is specialized for a specific backend.
 */
export interface ErdstallBackendClient<B extends Backend>
	extends ErdstallWatcher<[B]>,
		Contracter<[B]>,
		NFTMetadataProvider<[B]> {}

/**
 * Describes an active session which can observe Erdstall and its state as
 * well as take actions like sending transactions.
 */
export interface ErdstallSession<Bs extends Backend[]>
	extends ErdstallClient<Bs>,
		SelfSubscriber,
		OwnAccountGetter,
		Initializer<Bs>,
		Transactor,
		Minter,
		Burner,
		Trader,
		Depositor<Bs>,
		Withdrawer<Bs>,
		Exiter,
		Leaver<Bs> {
	/**
	 * The address connected to this session.
	 */
	readonly address: Address<Backend>;
}

export interface ErdstallBackendSession<B extends Backend>
	extends ErdstallBackendClient<B>,
		Depositor<[B]>,
		Withdrawer<[B]> {}
