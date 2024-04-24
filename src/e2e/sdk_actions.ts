// SPDX-License-Identifier: Apache-2.0
"use strict";
/*
import { Assets } from "#erdstall/ledger/assets";
import * as assets from "#erdstall/ledger/assets";
import { Session, Client, ErdstallSession } from "#erdstall";
import { PerunToken__factory } from "#erdstall/ledger/backend/ethereum/contracts";
import {
	Transfer,
	Mint,
	Trade,
	Burn,
	ExitRequest,
} from "#erdstall/api/transactions";

import { ethers, utils } from "ethers";
import { PERUN_ADDR, PART_ADDR } from "./parameters";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import {
	mkDefaultEthereumClientConstructor,
	mkDefaultEthereumSessionConstructor,
} from "#erdstall/ledger/backend/ethereum";
import {
	mkDefaultSubstrateClientConstructor,
	SubstrateClient,
} from "#erdstall/ledger/backend/substrate";

export type SDKActions = typeof sdkActions;

// The list of backends used for this test trace.
export type TestBackends = ["ethereum", "substrate"];

// sdkActions shows how to use the SDK for each step in a hypothetical
// scenario. Each key stands for one step a user might do when acting within
// the Erdstall system and shows how to assemble required parameter structures
// like `Assets` as well as give examples on how to use the results.
//
// E.g. looking up offchain minted NFTs which were transferred on-chain.
export const sdkActions = {
	// One can either create an `ErdstallClient` or an `ErdstallSession`. The
	// `ErdstallClient` is a passive observer of the system, while an
	// `ErdstallSession` is an `ErdstallClient` bound to a user. This gives a
	// session the additional ability to actively participate in the system by
	// sending transactions etc.
	create: async (
		nodeUrl: string,
		signer: ethers.Signer,
		operatorUrl: URL,
	): Promise<Session<TestBackends>> => {
		// First we need a provider which allows the SDK to communicate with the
		// underlying ledger. In the case of creating an `ErdstallClient` simply
		// creating the provider or querying it from the environment (e.g. MetaMask
		// in a browser-setting) is enough.
		const provider = new ethers.providers.JsonRpcProvider(nodeUrl);

		// Using the provider and the URL for the operator allows creating an
		// `ErdstallClient`.
		// const client = new Client(provider, operatorUrl);
		const client = new Client<TestBackends>(
			operatorUrl,
			mkDefaultEthereumClientConstructor(provider),
			mkDefaultSubstrateClientConstructor(),
		);
		// One could use this readonly client to listen for various events within
		// Erdstall by registering callbacks before issuing the
		// `client.initialize()` call.
		client.once("phaseshift", () => {
			// More on event down below.
		});
		client.removeAllListeners();

		// The SDK requires an `ethers.Signer` if an `ErdstallSession` is supposed
		// to be created. This signer can be obtained in a browser-setting by
		// calling the `provider.getSigner()` method (if the user has granted
		// access to your app using his account).
		const userAddr = EthereumAddress.fromString(await signer.getAddress());
		// const session = new Session(userAddr, signer, operatorUrl);
		const session = new Session<TestBackends>(
			userAddr,
			operatorUrl,
			signer,
			mkDefaultEthereumSessionConstructor(signer),
			{
				backend: "substrate",
				arg: 42,
				initializer: (_c) => new SubstrateClient(42),
			},
		);

		// We could now proactively set eventhandlers in place:
		//
		// (Offchain) Erdstall handlers:
		session.on("config", (_clientConfig) => {
			// Connecting to the Erdstall operator will result in a client
			// configuration being pushed containing the onchain Erdstall contract
			// address for verification, the network id we are currently on and the
			// POW depth (when are the outcomes of Erdstall finalized).
		});
		session.on("phaseshift", (_phaseShift) => {
			// Erdstall progressed and is now in a new epoch!
		});
		session.on("receipt", (_receipt) => {
			// Receiving some receipt of some transaction, more below!
		});
		session.on("open", () => {
			// The connection to the operator is open.
		});
		session.on("close", () => {
			// The connection to the operator was closed.
		});
		session.on("error", () => {
			// The connection to the operator was closed.
		});
		session.on("proof", (_proof) => {
			// We received a balance proof containing the balances of the account
			// declared in _proof.balance.account.
		});

		// (Onchain) Erdstall handlers:
		//
		// The origin of each on-chain event is tagged in each event under the
		// event.source field.
		// If your Session is defined as `Session<["ethereum" | "substrate"]>`, the
		// `event.source` field has the type `"ethereum" | "substrate"`.
		session.on("TokenTypeRegistered", (_tokenTypeRegisteredEvent) => {
			// A new token type with its token holder contract was registered on the
			// Erdstall smart contract.
		});
		session.on("Deposited", (_depositEvent) => {
			// A deposit was registered on Erdstall.
		});
		session.on("Withdrawn", (_withdrawEvent) => {
			// A withdraw was registered on Erdstall.
		});
		session.on("Challenged", (_withdrawEvent) => {
			// Someone challenged the operator, maybe he went rogue.
		});
		session.on("ChallengeResponded", (_repondedEvent) => {
			// Operator responded to the challenge, everything seems fine.
		});
		session.on("Frozen", (_frozenEvent) => {
			// Oops, apparently not fine. The contract is frozen and we can use our
			// latest valid balanceproof to withdraw our funds.
		});

		// It is good practice to free all registered eventhandlers when they are
		// not needed anymore.
		session.removeAllListeners();

		return session;
	},

	initialize: async (session: Session<TestBackends>) => {
		// Initialize the session. This connects us to the operator and grants us
		// the ability to extend our subscriptions in the next step.
		await session.initialize();
	},

	// Subscribing ensures that the `ErdstallClient` or `ErdstallSession`
	// receives events for phaseshifts, balanceproofs and tx-receipts.
	subscribe: async (session: Session<TestBackends>) => {
		return session.subscribeSelf();
	},

	deposit: async (
		session: Session<TestBackends>,
		ethAmount: bigint,
		prnAmount: bigint,
	) => {
		// Erdstall balances are abstract `Assets`. These assets contain individual
		// assets of the `Asset` type. Currently the SDK supports two types of assets:
		//
		// assets.Amount => fungible tokens like ETH, ERC20's etc.
		// assets.Tokens => non fungible tokens (NFT) of the ERC721 type.
		//
		// Here we are creating `Assets` containing some ETH and PRN which will be
		// used for depositing in the next step.
		const depositBal = new Assets(
			// NOTE: Make this ChainAssets.
			{
				token: assets.ETHZERO, // ETH is represented by the zero address 0x00..
				asset: new assets.Amount(ethAmount),
			},
			{
				token: PERUN_ADDR,
				asset: new assets.Amount(prnAmount),
			},
		);

		{
			const { stages, numStages: _numStages } = await session.deposit(
				"ethereum",
				depositBal as any,
			);
			// Depositing is a multi-stage process. ERC20 tokens like PRN have to be
			// approved first, before being transferred. Here this results in the
			// following stages:
			//
			// ETH => One transfer stage.
			// PRN => One approve stage + One transfer stage.
			//
			// console.info("Number of stages: ", _numStages); // > Number of stages: 3

			// One can use this information to update users on the current progress of
			// onchain transactions since they tend to take up quite some time in the
			// real world.
			for await (const [_name, stage] of stages) {
				// Each stage of a transaction comes with a name which also can be used
				// for improved UX or logging.
				const ctx = await stage.wait();
				// Also it is always advisable to assert the contract transactions status
				// to be a success.
				if (ctx.status !== 0x1) {
					// handle contract error.
				}
			}
		}

		{
			const { stages, numStages: _numStages } = await session.deposit(
				"substrate",
				{} as any,
			);
		}
	},

	offchainTransfer: async (
		alice: Session<TestBackends>,
		bob: Session<TestBackends>,
		prnAmount: bigint,
	): Promise<void> => {
		const amount = new Assets({
			token: PERUN_ADDR,
			asset: new assets.Amount(prnAmount),
		});
		// All off-chain transactions return a `Promise<PendingTransaction>`.
		// When a user is the source for a transaction, e.g. calling `session.transferTo(...)` then
		// the return value for that call can be awaited. The `PendingTransaction` in turn
		// contains promises for both the message that the transaction has been accepted `PendingTransaction.accepted`
		// and that for the transaction receipt `PendingTransaction.receipt`, which can be awaited
		// and timed as needed.
		//
		// When a user is the target for a transaction he will also receive a
		// txreceipt. These receipts can be caught using the `"receipt"`
		// eventhandler as shown below.
		const aliceTxReceipt = await (
			await alice.transferTo(amount, bob.address)
		).receipt;

		aliceTxReceipt.tx.sender.equals(alice.address); // true

		// Note how we use a `once` call. If a persistent eventhandler shall be
		// registered one can just use the equivalent `on` method on the
		// `ErdstallClient`/`ErdstallSession`.
		//
		// REMARK: In a real scenario Bob would have to register his `EventHandler`
		// BEFORE Alice sends her TX to guarantee him seeing it!
		//
		// Depending on the `subscribe` call issued beforehand bob could also
		// receive tx receipts for other users. This is the default for an
		// `ErdstallClient` because the `ErdstallClient` only contains a generic
		// `subscribe()` call and has no associated address!
		//
		// Remember that in the beginning we did a `client.subscribeSelf()`, so it
		// is assured that the eventhandlers only trigger if we (here it is bob)
		// are the target.
		bob.once("receipt", (bobTxReceipt) => {
			// The transaction receipts for `alice` and `bob` contain the same
			// information! One could play around with the information and assert
			// that certain conditions are met.

			// The types of transactions issued within Erdstall can be of different
			// forms. While we know that Alice simply issued a `transfer` to Bob, Bob
			// would have to assert beforehand WHAT he was the recipient for:

			const tx = bobTxReceipt.tx;
			switch (tx.txType()) {
				case Transfer:
					(tx as Transfer).recipient.equals(bob.address); // true
					break;
				case Mint:
					// Have fun with validating your mint tx.
					break;
				case Trade:
					// Have fun with inspecting your trades.
					break;
				case Burn:
					// Have fun asserting you burned your NFTs on Erdstall.
					break;
				case ExitRequest:
					// But make sure to come back (;
					break;
			}
		});
	},

	leave: async (session: Session<TestBackends>) => {
		// `leave` is a convenience function for first `exit`ing the Erdstall
		// system and afterwards `withdrawing` all available funds for the user.
		// So alternatively, if more control is required:
		//
		// const exitProof = await session.exit();
		//
		// -- Wait until the current phase of Erdstall has completed!
		// -- ^ This can be done using the `ErdstallClient.on("phaseshift", cb)`
		// --   callback!
		//
		// const { stages } = await session.withdraw(exitProof);
		const { stages } = await session.leave("ethereum");
		for await (const [_name, stage] of stages) {
			await stage.wait();
		}
	},

	mint: async (session: Session<TestBackends>, nftID: bigint) => {
		// Offchain minting is simply a matter of passing an ERC721 contract
		// address and an ID (unique!). Currently it is possible to mint for any
		// contract offchain which is registered in Erdstall and counts as an
		// `ERC721Mintable`.
		return (await session.mint(PART_ADDR, nftID)).receipt;
	},

	trade: async (
		charlie: Session<TestBackends>,
		dagobert: Session<TestBackends>,
		charlieNft: bigint,
		wantedPrnAmount: bigint,
	) => {
		// Charlie trades his PART-NFT for Dagobert's PRN.
		const offer = new Assets({
			token: PART_ADDR,
			asset: new assets.Tokens([charlieNft]),
		});
		const expect = new Assets({
			token: PERUN_ADDR,
			asset: new assets.Amount(wantedPrnAmount),
		});

		// Creating an offer will request the user to sign it beforehand.
		const tradeOffer = await charlie.createOffer(offer, expect);
		charlie.once("receipt", (charlieReceipt) => {
			// Charlie would like to know whether or not someone accepted his
			// tradeoffer. So he listens to soft breezes of txs whizzing around
			// Erdstall in the hopes of receiving a `Trade` receipt:
			const tx = charlieReceipt.tx;
			switch (tx.txType()) {
				case Trade:
				// Charlie lives happily ever after, because he was able to sell his
				// basket of Monkeys.
			}
		});

		// The interesting part is HOW this offer reaches Dagobert. This is not
		// part of Erdstall itself but rather a peculiarity of your application.
		// E.g. a NFT marketplace might implement its own trading logic and
		// distribution. Erdstall is only a validation and execution layer for this
		// matter.
		//
		// Here, Dagobert might have received the tradeoffer directly from Charlie,
		// or via a third party by winning in an auction.
		//
		// To finalise the trade, if both parties agree of course, the acceptee has
		// to sign the trade offer of Charlie and publish it within Erdstall, where
		// it gets validated and executed.
		return (await dagobert.acceptTrade(tradeOffer)).receipt;
	},

	burn: async (dagobert: Session<TestBackends>, formerCharlieNft: bigint) => {
		// Burning a NFT requires being the owner of it. Since Charlie transferred
		// his NFT in the step before, Dagobert is now able to do as he pleases.
		// Maybe he was not a fan of monkeys and now wants some lit whales.
		await dagobert.burn(
			new Assets({
				token: PART_ADDR,
				asset: new assets.Tokens([formerCharlieNft]),
			}),
		);
	},

	leavingAndSeeFundsOnchain: async function (
		session: Session<TestBackends>,
		provider: ethers.providers.Provider,
	) {
		const { stages } = await session.leave("ethereum");
		for await (const [, stage] of stages) {
			await stage.wait();
		}

		// Checking the funds onchain can be done by calling the appropriate
		// contracts. We will use `TypeChain` generated bindings for that. Since
		// this is not connected to the SDK and merely for completion one could
		// also just write his own wrappers around onchain contract calls.
		//
		// The SDK itself ships with some convenience contract wrappers for all
		// Erdstall related contracts, which frees you of the burden to come up
		// with bindings on your own.

		// NOTE: REINTRODUCE
		// // The SDK provides a convenience field for on chain calls which will grow
		// // over time. E.g.
		// [PERUN_ADDR, PART_ADDR]
		// 	.map((addr) => addr.toString())
		// 	.map((addr) => {
		// 		session.onChainQuerier.queryTokensOwnedByAddress(
		// 			"ethereum",
		// 			addr,
		// 			session.address.toString(),
		// 		);
		// 	});

		// The tokenProvider can be used to query information about tokens related
		// to Erdstall. The necessary `erdstallAddr` for these calls can be
		// obtained by registering a "config" eventhandler before
		// `client.initialize()` is called.
		//
		// session.tokenProvider.queryRegisteredTokenTypes(erdstallAddr);
		// session.tokenProvider.queryRegisteredTokens(erdstallAddr);

		// As can be seen here, for calls related to ethereum the `provider` has to
		// externally cached and is not (yet) accessible via the `ErdstallSession`
		// or `ErdstallClient` interface. This might change in the future and will
		// be reflected in the CHANGELOG as well as here.

		const prn = await PerunToken__factory.connect(
			PERUN_ADDR.toString(),
			provider,
		).balanceOf(session.address.toString());
		// NOTE: Hack.
		const part = {} as any;
		const eth = await provider.getBalance(session.address.toString());

		// In the case of Alice we would see the following output:
		utils.formatEther(prn); // "499.0"
		utils.formatEther(eth); // Between "99.0" and "100.0".
		part.toString(); // "1"

		// NOTE: We can use `utils.formatEther` on the PRN amount because just like
		// ETH and most default ERC20 tokens the default number of decimals is 18.
	},

	// This concludes the overview over the SDK.
};

*/