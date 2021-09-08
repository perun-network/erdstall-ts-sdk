# Erdstall TypeScript SDK

**What is Erdstall?**&emsp;<!--
-->[Erdstall](https://erdstall.dev) is a layer-2 platform for Ethereum developed by [PolyCrypt](https://polycry.pt) based on research by the chair of applied cryptography at the technical university of Darmstadt, Germany.
It uses a [TPM](https://en.wikipedia.org/wiki/Trusted_Platform_Module) — such as Intel SGX or ARM TrustZone — ensuring reliable and trustworthy execution of the platform without the need for public verification of all computations (in comparison to accumulated zero-knowledge proofs, TPMs allow the generation of more compact and less computationally expensive proofs, thereby scaling much better and consuming less power).
In Erdstall, the TEE operator periodically generates checkpoints, also called balance proofs, that can be used to exit the system if the operator were to go offline.

**Benefits of Erdstall**&emsp;<!--
-->In addition to scaling payments as a layer-2 platform, Erdstall also specifically aims to be the secure asset management layer for non-custodial off-chain marketplaces.
A marketplace building on top of Erdstall does not have to manage any funds on its own, it only has to match the trading parties, while earning a flat fee per facilitated trade.
This makes the marketplace more trustworthy, as a cyber-attack on the marketplace cannot result in lost funds.
As a result, Erdstall allows users to enjoy the security, control, and trust of non-custodial trading, combined with the low cost of off-chain transacting.
Meanwhile, market operators benefit from fast throughput and low operation costs, innate user-trust, and fast and cheap deposits and withdrawals via Erdstall.
Another benefit is that content creators can natively mint NFTs off-chain, and the cost of on-chain token creation only happens when the NFT is withdrawn by a user into the Ethereum mainnet.
Because our protocol is very light-weight, it is easy to integrate into existing solutions.

**Scope of this SDK**&emsp;<!--
-->This SDK is designed to offer the complete client-side functionality of Erdstall.
It natively integrates with any ethers.js provider, such as Metamask, as its wallet manager.
The SDK offers full control, but also packages the most important functionality into an easy-to-use API.
The SDK is designed such that code snippets that use Erdstall can be written generically to be reused within any site using Erdstall.
That way, common web components, such as payment/donation buttons, can easily be reused on your own homepage.

## Getting started

To get your Erdstall app started, there are a few steps you need to take.

**Importing Erdstall**&emsp;<!--
-->The Erdstall SDK is not published as a node package yet.
It has to be manually cloned and locally registered as a node module like this:
```sh
	git clone https://github.com/perun-network/erdstall-ts-sdk.git erdstall
	cd erdstall
	yarn devpub # builds the module into dist/ and creates publishing package.json
	cd dist
	yarn link # creates link in yarn cache to package @polycrypt/erdstall
	cd <your-project>
	yarn link @polycryt/erdstall # links to package from yarn cache
```
You now have a link to the SDK in your project's `node_modules` directory.

You can now import from the SDK like:
```ts
import { Erdstall } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";
// or if you prefer a namespace handle
import * as erdstall from "@polycrypt/erdstall";
```


**Creating the client object**&emsp;<!--
-->The SDK is straight-forward to use: everything you need is neatly bundled in the `erdstall.Erdstall` interface, which you can instantiate via `erdstall.NewClient()`, as follows:

```ts
// Initialize these fields with values received from your ethers or web3 setup.
var ethAccount: {address: erdstall.ledger.Address, signer: ethers.Signer};
// Create client object.
let client = erdstall.NewClient(
	ethAccount.address,
	ethAccount.signer,
	new URL("https://operator.erdstall.dev"));
// Set up any event listeners needed by the application.
// client.on(event, handler);
// Establish the client's connection.
await client.initialize();
myDApp.run(client);
```

**Setting up events**&emsp;<!--
-->After creation, the Erdstall client is now only partially initialized.
Now is the time to set up any `erdstall.ledger.ErdstallEvent` and `erdstall.enclave.EnclaveEvent` handlers using `Erdstall.on()` and `Erdstall.once()`.
The following `EnclaveEvent` events exist (emitted event types are written in parentheses):

* **`"open"`**:
		triggered when the connection to Erdstall is established.
	This event is triggered again if the Erdstall connection is lost and automatically re-established.
	This is the most important event and must be set during setup, or it might get lost.
	Use this event to launch your Erdstall-related logic.
	Alternatively, if you can `await client.initialize()`, which does the same as waiting for this event.
* **`"receipt"(erdstall.TxReceipt)`**:
		triggered when a receipt is received from a transaction subscription.
	This does not include transaction receipts directly received as a response when issuing transactions.
	A transaction receipt contains the transaction, an affected party, and the party's new balance.
* `"close"`: triggered when the connection to Erdstall is terminated due to any reason.
* `"error"`: triggered when an error occurred with the Erdstall connection.
* `"proof"(erdstall.BalanceProof)`:
		triggered when a balance proof is received from a proof subscription.
	These balance proofs are used for exiting the system in case the operator ceases to function.
* `"exitproof"(erdstall.BalanceProof)`:
		triggered when a balance proof intended for exiting Erdstall on-chain is received from a proof subscription.
	This happens after a call to `Erdstall.exit()` or during `Erdstall.leave()`.

The following `ErdstallEvent` smart contract events exist:

* **`"Deposited"`**:
		you deposited money into Erdstall.
* **`"Withdrawn"`**:
		you withdrew funds from Erdstall.
* `"Frozen"`:
		an unrecoverable error occurred and the Erdstall system is now frozen forever, and funds must be withdrawn using the latest "sealed" balance proof.
* `"Challenged"`:
		someone challenged the Erdstall operator to prove it is still alive.
* `"ChallengeResponded"`:
		the Erdstall operator successfully proved it still operates.
* `"TokenTypeRegistered"`:
		a new token type (such as ETH, ERC20, ERC721, etc.) has been registered with Erdstall on-chain.
* `"TokenRegistered"`:
		a specific token contract has been registered on-chain.


**Finishing up**&emsp;<!--
-->After all events have been set up, call `Erdstall.initialize()` to establish the client's connection to the Erdstall ledger.
You're now good to go!
The `open` event will be triggered and your logic will launch.

### TypedJSON

The Erdstall SDK internally uses [`TypedJSON`](https://github.com/JohnWeisz/TypedJSON) to define class JSON serialization.
If you want to use TypedJSON in your project for class serialization, possibly using some Erdstall classes as field types, you _must_ use the re-exported module `typedjson` from `@polycrypt/erdstall/export/typedjson` like
```ts
import { jsonObject, jsonMember, TypedJSON } from "@polycrypt/erdstall/export/typedjson";
```

The reason is that TypedJSON internally registers class serializations in static members of the `TypedJSON` class.
If you use your own version of `typedjson` from your `node_modules`, these modules will not share state and serialization will not work.

## Using the Erdstall client

The Erdstall client mainly offers these operations:

**Deposits and withdrawals**&emsp;<!--
-->`Erdstall.deposit(erdstall.ledger.Assets)` creates a bunch of Ethereum transactions that need to be sent on-chain to deposit the requested amount of assets into Erdstall.
Once the transactions are confirmed on-chain, the funds will be made available in Erdstall.
To withdraw your funds, `Erdstall.leave()` can be used.
It requests that the user exits, then, after a balance proof is issued, returns a bunch of Ethereum transactions that need to be sent on-chain immediately.
These transactions will withdraw the user's funds from Erdstall back into his normal wallet.

**Subscriptions**&emsp;<!--
-->Subscribe to events using `Erdstall.subscribeTXs(filter: erdstall.ledger.Address?)` and `Erdstall.subscribeBalanceProofs(filter: erdstall.ledger.Address?)`.
Both of these calls will listen for their respective events for either all accounts, or only for the account passed to the call.
Each call also has a corresponding `unsubscribe` version.
The current balance of any account can be queried using `Erdstall.getAccount(erdstall.ledger.Address)`.

**Off-chain transacting**&emsp;<!--
-->To transfer funds within Erdstall, use `Erdstall.transferTo(erdstall.ledger.Assets, erdstall.ledger.Address) TXReceipt`.
This transfers the specified assets to the specified recipient, and returns the sender's new balances.
This is only a simple transaction, and only useful for payments, but not for digital asset trades.

**Off-chain trading**&emsp;<!--
-->Erdstall natively supports digital asset trades in the form of fungible and non-fungible tokens (FT, NFT).
All trading requires an external marketplace that builds on-top of Erdstall.
The marketplace's role is to facilitate order match-making and to track the currently open offers.
Trading works as follows:

1. The seller creates a trade offer — which is a promise indicating he is willing to trade certain assets for a certain price — and sends it to a market operator.
2. The market operator broadcasts the trade offer to potential buyers, who can respond with a trade agreement, indicating they are willing to match the offer.
3. The market operator sends both the trade offer and the trade agreement to Erdstall.

>*This is currently not implemented, we still need to create a more unified API on how to connect the Erdstall client to any Market operator, both for proposing and accepting trades.*

**Off-chain NFT minting**&emsp;<!--
-->`Erdstall.mint(erdstall.ledger.Address, erdstall.Uint256) TXReceipt` can be used to create a new token of the specified kind and with the specified ID.
The NFT can then be traded freely, and is only minted on-chain upon withdrawal.

## Development

**Contract bindings**&emsp;<!--
-->Contract bindings have to be generated from the [`erdstall-contracts`]("https://github.com/perun-network/erdstall-contracts") repository.
Just clone it into a directory of your choice and execute `yarn bindings <path/to/erdstall-contracts>`.
**Note**: Do not forget to install the dependencies in `erdstall-contracts` with `yarn`.

## License

This work is released under the Apache 2.0 license. See LICENSE file for more
details.

_Copyright (C) 2021 - The Erdstall Authors._
