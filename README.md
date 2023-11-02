# Erdstall TypeScript SDK

[![CI Status](https://github.com/perun-network/erdstall-ts-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/perun-network/erdstall-ts-sdk/actions/workflows/ci.yml)
[![TypeDoc Status](https://github.com/perun-network/erdstall-ts-sdk/actions/workflows/typedoc.yml/badge.svg)](https://perun-network.github.io/erdstall-ts-sdk/)
[![@polycrypt/erdstall at npm](https://img.shields.io/npm/v/@polycrypt/erdstall)](https://www.npmjs.com/package/@polycrypt/erdstall)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202-blue)](https://www.apache.org/licenses/LICENSE-2.0.txt)

This SDK offers the complete client-side interaction with an [Erdstall](https://erdstall.dev/) second-layer Ethereum network. It natively integrates with any [ethers.js](https://docs.ethers.io/) wallet, such as [Metamask](https://metamask.io/) for frontends or [ethers' `JsonRpcProvider`](https://docs.ethers.io/v5/api/providers/jsonrpc-provider/) for backends.

## Getting started

You can install the Erdstall SDK from [npm](https://www.npmjs.com/package/@polycrypt/erdstall) and then setup a client instance like:

```ts
import { ethers } from "ethers";
import { Client } from "@polycrypt/erdstall";

const ethRpcUrl = "ws://127.0.0.1:8545/"; // local Ganache
const erdOperatorUrl = new URL("ws://127.0.0.1:8401/ws"); // local Erdstall Operator

const ethProvider = new ethers.providers.JsonRpcProvider(ethRpcUrl);
const erdClient = new Client(ethProvider, erdOperatorUrl);
// Set up any event listeners needed by the application.
// client.on(event, handler);
// Then initialize the client and setup subscriptions.
await erdClient.initialize();
await erdClient.subscribe(); // subscribes to all receipts and balance proofs

// Start your dApp with the Erdstall client
myDApp.run(client);
```

A client will only be able to perform read-only operations in Erdstall.
If you want to use your existing wallet to transact on Erdstall, use a session instead of a client; you can do so as follows:

```ts
import { ethers } from "ethers";
import { Session } from "@polycrypt/erdstall";
import { Address } from "@polycrypt/erdstall/ledger";

const erdOperatorUrl = new URL("ws://127.0.0.1:8401/ws"); // local Erdstall Operator

await window.ethereum.enable()
const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
const address = Address.fromString(await signer.getAddress());

const session = new Session(address, signer, erdOperatorUrl);
await session.initialize();
await session.subscribe(); // subscribes to all receipts and balance proofs
```

Additionally, you can set up a custodial wallet session (locally managed keys without an external signer) using the following code:

```ts
import { Session } from "@polycrypt/erdstall";

const ethRpcUrl = new URL("ws://127.0.0.1:8545/"); // local Ganache
const erdOperatorUrl = new URL("ws://127.0.0.1:8401/ws"); // local Erdstall Operator
const { session, privateKey } = Session.generateCustodial(ethRpcUrl, erdOperatorUrl)

await db.save(privateKey); // Save the private key for re-use.
await session.initialize();
await session.subscribe(); // subscribes to all receipts and balance proofs

// Start your dApp with the Erdstall client
myDApp.run(session);
```

This may be useful for running Erdstall in a setting where no external wallet provider (such as MetaMask) exists, e.g. in a node.js server or when using custodial or throwaway wallets in a website.

### More documentation

[This repository's Github Wiki](https://github.com/perun-network/erdstall-ts-sdk/wiki/Erdstall-SDK) contains a description of the CI end-to-end test, whose sources act as a **full tutorial for the SDK**.

TypeScript declaration files are shipped with the npm package. Full [TypeDoc](https://typedoc.org/)-generated documentation of the source code can be found at [this repository's Github pages](https://perun-network.github.io/erdstall-ts-sdk/).

## Erdstall interactions

The SDK's primary goal is to facilitate interaction with an Erdstall off-chain network as well as the on-chain Erdstall smart contract. The following describes the most important functions of `ErdstallClient`s (read-only) and `ErdstallSession`s (also writing).

### Account queries

The current balance of any account can be queried using `Erdstall.getAccount(who)`.

### Entering and leaving

Fungible Tokens and NFTs can be deposited into the Erdstall network by calling
`ErdstallSession.deposit(assets)`. This call returns a list of promises of on-chain transactions. Only after all those transactions are mined are the deposits successful. The assets will be available in Erdstall once the blocks containing them have reached the enclave and sufficient finality depth has been reached.

To exit an Erdstall network with all assets, call `ErdstallSession.leave()`. This will first send an `exit` request to the Erdstall enclave. Once the epoch has ended, an exit proof will be received from the operator. Due to protocol-security-related reasons, it now has to be waited for another full epoch before an on-chain `withdraw` transaction can be sent to the Erdstall contract, containing the exit proof that was received in the prior epoch. The call returns a list of transaction promises. Once all those transactions have been mined, the user's assets will be withdrawn from Erdstall back into their Ethereum wallet.

### Erdstall transactions

The following transactions are currently possible in any Erdstall network.

#### Transfers

To transfer assets within Erdstall, use `Erdstall.transferTo(assets, to)`.
This transfers the specified assets to the specified recipient, and returns a transaction receipt.

#### Trading

Erdstall natively supports (basket) trading of tokens and NFTs. Currently, simple two-step offer and accept trading is supported. Some external marketplace infrastructure needs to be in place to present trade offers to potential buyers, who can then execute a trade on the Erdstall network.

A trade offer can be created using `ErdstallSession.createOffer()`. The returned `TradeOffer` needs the external marketplace infrastructure to reach potential buyers. An interested buyer can then execute the trade by calling `ErdstallSession.acceptTrade(offer)`, which will send a `Trade` transaction to the Erdstall network, atomically exchanging the assets between the two accounts.

#### NFT minting & burning

`ErdstallSession.mint(token, id)` can be used to mint a new NFT with on-chain contract address `token` and id `id`. The NFT can then be traded freely and is only minted on-chain upon withdrawal.

NFT-owners can burn their tokens with a `ErdstallSession.burn(nfts)` transaction call. If the NFT was deposited into Erdstall, it will not be burned on-chain, but will indefinitely be locked-up and be held by the NFT-Holder contract.

## Event Subscriptions & Callbacks

After creating an Erdstall client, event handlers can be set up using `Erdstall.on()` and `Erdstall.once()`, like

```ts
erdClient.on("receipt", (rec) => {
	console.log(`Transaction by ${rec.tx.sender}`);
});
```

Handlers set up with `on` are persistent and are called every time the respective
event is received. `once`-handlers are only called once and then removed from
the list of handlers. Both type of handlers can also be removed by calling
`Erdstall.off()`.

Once all event handlers are setup, first `await Erdstall.initialize()` to initialize the client, then `await Erdstall.subscribe()` to subscribe to all balance proofs and transaction receipts for all users, or filter to a specific user with address `who` by calling `Erdstall.subscribe(who)`. `ErdstallSession.subscribeSelf()` is a shortcut for subscribing a session to the own user.
Note that handlers can also be added or removed after the client has already been initialized and subscribed.

<details><summary>The following <code>EnclaveEvent</code> events exist (emitted event types are written in parentheses):</summary>

-   **`"open"`** is triggered when the connection to Erdstall is established.
    This event is triggered again if the Erdstall connection is lost and automatically re-established.
    At startup, you can alternatively use `await client.initialize()` instead of setting up a handler for this event.

-   **`"config"(ClientConfig)`** is triggered when the client configuration is received from the operator after establishing the connections.

-   **`"close"`** is triggered when the connection to Erdstall is terminated due to any reason.

-   **`"error"(string | Error)`** is triggered when an error occurres within the Erdstall client.

-   **`"receipt"(TxReceipt)`** is triggered when a receipt is received from a transaction subscription.
    This does not include transaction receipts directly received as a response when issuing transactions.
    A transaction receipt contains the transaction itself and the changed balances of all affected parties.

-   **`"proof"(BalanceProof)`** is triggered when a balance proof is received from a proof subscription.
    These balance proofs are used for exiting the system in case the operator goes offline.

-   **`"exitproof"(BalanceProof)`** is triggered when a balance proof, intended for exiting the Erdstall network, is received from a proof subscription.
    This happens after a call to `Erdstall.exit()` or during `Erdstall.leave()`.

-   **`"phaseshift"`** is triggered when a phase shift in the Erdstall network occured, i.e., the last block of an epoch got processed by the enclave.
</details>

<details><summary>The following <code>LedgerEvent</code> smart contract events exist:</summary>
All on-chain events return a type of the same name as the event, so they are
omitted after each event name in the following.

-   **`"Deposited"`**: an asset got deposited into Erdstall on-chain.

-   **`"Withdrawn"`**: assets got withdrawn from Erdstall on-chain.

-   **`"Frozen"`**: the operator failed to respond to a challenge within the challenge period. The Erdstall system is now frozen forever, and funds must be withdrawn using the latest _sealed_ balance proof.

-   **`"Challenged"`**: someone challenged the Erdstall operator, who must now respond with the challenged balance proof.

-   **`"ChallengeResponded"`**: the Erdstall operator successfully responed with the correct balance proof.

-   **`"TokenTypeRegistered"`**: a new token type (such as ETH, ERC20, ERC721, etc.) has been registered with Erdstall on-chain.
</details>

## Development

### TypedJSON

The Erdstall SDK internally uses [`TypedJSON`](https://github.com/JohnWeisz/TypedJSON) to define class JSON serialization.
If you want to use TypedJSON in your project for class serialization, possibly using some Erdstall classes as field types, you _must_ use the re-exported module `typedjson` from `@polycrypt/erdstall/export/typedjson` like

```ts
import {
	jsonObject,
	jsonMember,
	TypedJSON,
} from "@polycrypt/erdstall/export/typedjson";
```

The reason is that TypedJSON internally registers class serializations in static members of the `TypedJSON` class.
If you use your own version of `typedjson` from your `node_modules`, these modules will not share state and serialization will not work.

#### `bigint` members

If you use TypedJSON to serialize your own classes and they have a field of type `bigint`, it is best to use the annotation `@jsonBigIntMember()` from `@polycrypt/erdstall/export/typedjson`, which defines a base-10 string serialization format.

### Contract bindings

Contract bindings can be generated from the [`erdstall-contracts`](https://github.com/perun-network/erdstall-contracts) repository.
Just clone it into a directory of your choice and execute `yarn bindings <path/to/erdstall-contracts>`.
**Note**: Do not forget to install the dependencies in `erdstall-contracts` with `yarn`.

## Background

### Erdstall

[Erdstall](https://erdstall.dev) is a layer-2 platform for Ethereum developed by [PolyCrypt](https://polycry.pt) based on research ([:page_facing_up: CommiTEE](https://eprint.iacr.org/2020/1486)) by the chair of applied cryptography at the technical university of Darmstadt, Germany.

It uses a [TPM](https://en.wikipedia.org/wiki/Trusted_Platform_Module) — such as Intel SGX or ARM TrustZone — ensuring reliable and trustworthy execution of the platform without the need for public verification of all computations (in comparison to accumulated zero-knowledge proofs, TPMs allow the generation of more compact and less computationally expensive proofs, thereby scaling much better and consuming less power).
In Erdstall, the TEE operator periodically generates checkpoints, also called balance proofs, that can be used to exit the system if the operator were to go offline.

### Benefits of Erdstall

In addition to scaling payments as a layer-2 platform, Erdstall also specifically aims to be the secure asset management layer for non-custodial off-chain marketplaces.

A marketplace built on top of Erdstall does not have to manage any funds on its own, it only has to match the trading parties, while it can earn a flat fee per facilitated trade.
This makes the marketplace more trustworthy, as a cyber-attack on the marketplace cannot result in lost funds.
As a result, Erdstall allows users to enjoy the security, control, and trust of non-custodial trading, combined with the low cost of off-chain transacting.
Meanwhile, market operators benefit from fast throughput and low operation costs, innate user-trust, and fast and cheap deposits and withdrawals via Erdstall.
Another benefit is that content creators can natively mint NFTs off-chain, and the cost of on-chain token creation only happens when the NFT is withdrawn by a user into the Ethereum mainnet.
Because our protocol is very light-weight, it is easy to integrate into existing solutions.

## License

This work is released under the Apache 2.0 license. See LICENSE file for more
details.

_Copyright (C) 2021 - The Erdstall Authors._
