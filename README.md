# Wildcard (formerly Erdstall) TypeScript SDK

[![@polycrypt/erdstall at npm](https://img.shields.io/npm/v/@polycrypt/erdstall)](https://www.npmjs.com/package/@polycrypt/erdstall)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202-blue)](https://www.apache.org/licenses/LICENSE-2.0.txt)

This SDK offers the complete client-side interaction with the [Wildcard](https://erdstall.dev/) second-layer multi-chain network. It can handle deposits and withdrawals and bridging of L1 funds from any chain connected to Wildcard (currently, we support Ethereum and Substrate). Wildcard is still in closed testing and development, but we will go into a public testnet phase in 2025/Q3.

> [!NOTE]
> Wildcard started out as "Erdstall". The rename to Wildcard is still somewhat pending, so you will still find references to "Erdstall" everywhere.

You can install the SDK from [npm](https://www.npmjs.com/package/@polycrypt/erdstall) or directly clone this repository and run `make` to build and bundle it.

---

>**Table of contents**
>
>* [Repository structure](#repository-structure)
>* [Wildcard design](#wildcard-design)
>    * [Design goals](#design-goals)
>    * [The multi-chain asset model](#the-multi-chain-asset-model)
>    * [The multi-chain account model](#the-multi-chain-account-model)
>    * [Wildcard-native asset collections](#wildcard-native-asset-collections)
>    * [Finality and security model](#finality-and-security-model)
>* [Using the SDK](#using-the-sdk)
>    * [Connecting to Wildcard](#connecting-to-wildcard)
>    * [Handling assets](#handling-assets)
>    * [Deposits and withdrawing](#deposits-and-withdrawing)
>    * [Account queries](#account-queries)
>    * [Event Subscriptions & Callbacks](#event-subscriptions--callbacks)
>    * [Handling pending L2 transactions](#handling-pending-l2-transactions)
>    * [Transfers](#transfers)
>    * [Trading](#trading)
>    * [NFT minting](#nft-minting)
>    * [Token burning](#token-burning)
>* [Development](#development)
>    * [TypedJSON](#typedjson)
>        * [`bigint` members](#bigint-members)
>    * [Contract bindings](#contract-bindings)
>* [License](#license)

---


> [!IMPORTANT]
>**How to read this documentation**&emsp; Wildcard is still in pre-testnet stage / closed development. The goal of this documentation is to give a rough explanation of how the entire system works (at an appropriate level of detail), and to give an overview of where things are located and how they relate to each other, so that the reader has tools he needs to navigate the code himself and gain a deeper understanding. Wildcard is still an evolving system and not fully open to the public yet — creating and maintaining an exhaustive and accurate documentation of every feature and design decision and implementation detail will unnecessarily impede the development speed as it has causes friction each time we change anything. Once Wildcard is in the public testnet phase, we will switch to a more conservative mode of development.
>
>We generally try to refine our code to be expressive and readable (as it will have to be auditable and trustworthy to the public), but should questions or problems pop up regardless, feel free to contact the developers directly on our discord (you can find it on [our website](https://polycry.pt/)) for a quick and authoritative answer.




## Repository structure




**Root package: `@polycrypt/erdstall`**&emsp; We have the main Wildcard dApp connection types in the root directory:

* `App`&emsp; An L2-only connection that does not connect to any L1 chains, and is not associated with an account. It lets you monitor the L2 chain with a very lightweight setup.
* `WritingApp`&emsp; An L2-only connection that is associated with an account. By not maintaining connections to the various connected L1 chains, it is more lightweight, and should be preferred for Wildcard-native/Wildcard-only dApps. It extends the `App` class with functionality for issuing L2 transactions. Most dApps should probably use this option.
* `Client`&emsp; A L1 & L2 connection to Wildcard that is not associated with an account. It extends `App` with functionality for observing chains. This is useful for building a chain explorer.
* `Session`&emsp; A L1 & L2 connection to Wildcard that is associated with an account. It inherits from `WritingApp`, extending it with functionality for depositing and withdrawing funds from/to the various connected chains. This option offers the full functionality of the Wildcard SDK. Only dApps that want to directly integrate the deposit/withdraw workflow might need this; other dApps can outsource that functionality to our general frontend.

**Sub-package `api`**&emsp; In `@polycrypt/erdstall/api`, we implemented the Wildcard-specific message types. Some of these are not relevant for dApps, while others are exposed as return values or event types.
* **Sub-package `api/calls`**&emsp; Contains non-transaction commands from the client to the Wildcard operator.
* **Sub-package `api/responses`**&emsp; Contains any messages the Wildcard operator sends to the client, most of which are for internal use only. The most important types here are:
    * `ClientConfig`&emsp; Gets sent to a dApp connection when first connecting. It contains the genesis time of the Wildcard L2, its epoch duration (i.e., the balance proof issuance frequency), and the various connected L1 chains, as well as the cryptographic identities of the Wildcard TEE.
    * `TxReceipt`&emsp; _(Not to be confused with `ledger/backend.TxReceipt`)_ A receipt for a processed transaction. Contains a `.status` field (see `TxStatusCode` enum accompanying the `TxReceipt` class for all the possible status codes) for checking the success of the transaction, and a `.error` field containing an error string in case the transaction failed.
* **Sub-package `api/transactions`**&emsp; Contains the L2 transaction types, most of these are not directly used by wildcard dApps. Instead, direct commands on the session object are used to send transactions. The exception is:
    * `TradeOffer`&emsp; Not a transaction by itself, but is used in the `Trade` transaction. It contains a signed offer of a seller for an exchange of funds, offering the exchange of two baskets of assets. A buyer can then agree to the exchange by sending a `Trade` transaction containing the seller's offer.

**Sub-package `crypto`**&emsp; In `@polycrypt/erdstall/crypto`, we have the generic types for account addresses, signatures, and signers, while the subdirectories `crypto/ethereum` and `crypto/substrate` contain the various specific implementations.
* `Address`&emsp; An address representing an account associated with a cryptographic signer. It is used to identify an account and to verify signatures from that account. Addresses are not considered to be bound to any chain, so the same ethereum address represents the same account on all ethereum chains and on the native L2 ledger. The native ledger supports all address types, while the various L1 chains usually only support a single address type. As we add more chains employing diverse cryptographic schemes, more address types will be added.
* `Signer`&emsp; A signer controlling an account. Signers are used to send L2 transactions, as well as L1 transactions (on associated chains). Just like addresses, signers are not inherently bound to a specific chain, and only represent the cryptographic key pair that defines an account.
* `Signature`&emsp; A signature issued by a signer of any type. Given an address, this can verify the authenticity of a message. The Wildcard TEE uses these to authenticate transaction receipts and balance proofs. They are also used to authenticate L2 transactions and L2 trade offers. The Wildcard TEE has an address of the appropriate type associated with every connected chain, as well as one native address for L2-only messages.
* `AssetID`&emsp; The multi-chain asset descriptor. See §[The multi-chain asset model](#the-multi-chain-asset-model).

**Sub-package `enclave`**&emsp; Contains the internal implementation of the Wildcard RPC protocol. It is not intended for direct third-party use.

**Sub-package `export`**&emsp; Currently only re-exports the global `typedjson` instance we are using for our JSON serialisation. Third-party applications that for some reason want to access this functionality manually, should use this package to ensure that they operate on the same global state configuration. See §[TypedJSON](#typedjson).

**Sub-package `ledger`**&emsp; Here, we have types for Wildcard's native L2 ledger.
* `Chain`&emsp; Our global chain identifier enum.
* `Account`&emsp; The state of an L2 account on Wildcard, including nonce, balances, and more.

**Sub-package `ledger/assets`**&emsp; Contains the asset datatypes.
* `ChainAssets`&emsp; A basket of assets, grouped by their chain of origin.
* `Asset`&emsp; The abstract base class for all asset types.
* `Tokens`&emsp; A list of NFT IDs sharing the same collection. An ID is a `uint256`. Inherits from Asset.
* `Amount`&emsp; A fungible currency amount. An amount is a `uint256`. Inherits from Asset.

**Sub-package `ledger/backend`**&emsp; Contains chain-independent abstractions for the various L1 transactions issued by Wildcard.
* `WildcardTx`&&emsp; Abstract base class semantically representing the contents of an actual chain-specific L1 transaction in a chain-agnostic manner, allowing for easier generic handling of transactions by an application without forcing the developer to write chain-specific code.
* `UnsignedTx`&emsp; A prepared L1 transaction that has not yet been signed. Via `.description`, a trusted and tamperproof `WildcardTx` instance can be retrieved (as long as the origin of the `UnsignedTx` is trustworthy). These can be signed via `Session.signTx()`.
* `SignedTx`&emsp; A L1 transaction that has been signed but not yet been sent. Also has the `.description` field. These can be sent using `Session.sendTx()`.
* `TxReceipt`&emsp; (not to be confused with `api/responses.TxReceipt`) A receipt to a L1 transaction that can be used to check up on its completion and status (success / revert). Has an awaitable `success: Promise<boolean>` field indicating the eventual finalisation and status code of the transaction.
* `TxSigner`, `TxSender`&emsp; Internal objects standardising the way in which the various chains' L1 transactions are signed and sent, respectively.
* `UnsignedTxBatch`, `SignedTxBatch`, `TxReceiptBatch`&emsp; These allow a batch of transactions to be treated as one cohesive unit, allowing for batch signing and batch sending, as well as more robust nonce management. Since single Wildcard actions might have to be broken down into multiple on-chain transactions depending on the target chain, this helps us create more robust treatment of such actions. Batch versions of session transaction commands exist: `Session.signTxBatch` and `Session.sendTxBatch()`.

**Sub-package `test`**&emsp; Contains internal helpers for testing.

**Sub-package `utils`**&emsp; Contains mostly internal helpers for various tasks, such as encoding hexadecimal numbers, call/response message matching, and more. It is not intended for direct use by third-party projects, but exposed nonetheless. One exception is the `PendingTransaction` interface: it contains two promises: `.accepted` to query that the Wildcard operator has received a L2 transaction, and `.receipt`, which is a promise to a `TxReceipt`, which lets us verify the execution of the L2 transaction and whether it succeeded or failed.








## Wildcard design







[Wildcard](https://erdstall.dev) is a multi-chain layer-2 platform currently connecting Ethereum and Substrate, developed by [PolyCrypt](https://polycry.pt) based on research ([:page_facing_up: CommiTEE](https://eprint.iacr.org/2020/1486)) by the chair of applied cryptography at the technical university of Darmstadt, Germany.

It uses a [TEE](https://en.wikipedia.org/wiki/Trusted_execution_environment) — such as Intel SGX — ensuring reliable and trustworthy execution of the platform without the need for public verification of all computations (in comparison to accumulated zero-knowledge proofs, TEEs allow the generation of more compact and less computationally expensive proofs, thereby scaling much better and consuming less power).
In Wildcard, the TEE operator periodically generates checkpoints, also called balance proofs, that can be used to exit the system if the operator were to go offline.
In contrast to other L2 system approaches, in the happy case, these checkpoints never have to be posted on-chain, reducing costs.





### Design goals




**Performant many-chain L2 asset management layer**&emsp; Wildcard is designed to create a scalable, trustworthy web3 with web2-like performance.
Its native layer-2 ledger aims to be the best possible asset management layer it can be, both performance-wise and user-experience-wise.
Specifically, we want to enable fast and cheap non-custodial marketplaces with our L2.
We want to keep the feature set strictly limited to things that further our core mission, so that the codebase remains manageable and auditable, and the platform scalable — hence, there will be no direct support for smart contracts on Wildcard (but we have future plans for externally hosted, TEE-based smart contracts).
Wildcard will grow to be not just multi-chain, but many-chain, acting as a hub that overcomes the silo effect of blockchains.
We are currently in the process of laying the technological foundations for that future.

**Simplicity of development: chain agnostic design**&emsp; Furthermore, we aim to lower the technical complexity that developers face when writing blockchain-facing applications: blockchains have a high complexity to even use, and it is almost a science unto itself to use them securely, with each chain having lots of peculiarities that pose a significant entry barrier for new developers.
With Wildcard, developers do not have to know anything about specific chains, as long as they stay within the functionality provided directly by Wildcard.
The chain-agnostic design of Wildcard allows developers of web3 services to focus entirely on their business logic, without requiring blockchain-specific know-how.

**Low fees and fast confirmations**&emsp; With the unique combination of a lean feature set and the great energy-efficiency and performance of TEEs compared to other proof systems, we aim to offer the best user experience we can.
Using TEEs, we can achieve well over a thousand transactions per second with sub-second confirmation times, with lots of room for improvement for further scaling.

**Non-custodial marketplaces**&emsp; With our trading transactions, users can sign a trade offer specifying a give-and-take amount that others can choose to accept, and Wildcard will atomically execute that trade.
This aims to be the foundation that will allow non-custodial marketplaces to be built on top of Wildcard that do not have to manage any user funds on their own, instead only having to match the trading parties, while they can earn a flat fee per facilitated trade.
This makes marketplaces on Wildcard more trustworthy, as a cyber-attack on the marketplace cannot result in lost funds.
As a result, Wildcard allows users to enjoy the security, control, and trust of non-custodial trading, combined with the speed and low cost of off-chain transacting.
Meanwhile, market operators benefit from fast throughput and low operation costs, low risk, innate user-trust, and fast and cheap deposits and withdrawals via Wildcard's L2 ledger, without even requiring much technical know-how.

**L2 minting**&emsp;
Wildcard can also natively mint NFTs off-chain, and the cost of on-chain token creation only happens when the NFT is withdrawn by a user into a L1 chain.
Because our protocol is very light-weight, it is easy to integrate into existing solutions.

**User-oriented experience**&emsp;
We aim our feature set and services towards end users and developers aiming to provide practical value for end users. We will introduce a mixed fee model consisting of a free tier which does not have to pay fees, but might have to provide some proof of work or other spam mitigation measure (or IP-based rate limiting), as well as a tiered subscription model with transaction quotas and a much higher amount of system resources alloted to it. Additionally, for one-off usage, we also offer pay-per-use transaction fees. Leveraging our unique technology stack, we can guarantee stable transaction fees and performance within fee tiers, without massive price spikes caused by competitive bidding. We also aim to prevent transactions being stuck in the pending pool forever, without certainty of when or whether they will be processed at all. Instead, we directly commit to process a transaction within a short time or reject it immediately due to high system load. This gives users a clear assurance of what the system will or will not do.







### The multi-chain asset model





Wildcard is a multi-L1 chain, its L2 ledger acting as a hub between chains, and as a fast chain-agnostic asset management layer. Since it is not bound to a single chain, we introduced an abstraction: we offer the `erdstall/crypto.AssetID` type to represent assets from various origin chains in a uniform manner.

**Chain identifier**&emsp; Each chain has a 16-bit unsigned integer as its identifier (this identifier is independent of any chain-native identifiers). Wildcard's native L2 ledger has chain ID 0. Test chains IDs in the upper half of the numer range, while mainnet chains have lower half IDs. Chain names associated with a chain ID can be displayed via `erdstall/ledger.getChainName()`. Use the `erdstall/ledger.Chain` enumeration to refer to chains.

**Asset types**&emsp; Currently, Wildcard recognises only fungible and non-fungible tokens (NFTs). More asset types might get added over time (e.g., fractional NFTs). Use the `erdstall/crypto.AssetType` enumeration to refer to these.

**Collection identifiers**&emsp; Chain-native collections are represented using a 32 byte identifier, which either contains the plain chain-native collection identifier if it fits within 32 bytes, or a 32-byte hash of it.

Together, these three fields form an identifier such as (for a Wildcard-native NFT collection), which we like to handle as a 35-byte array:

```
Erdstall/NFT/0xf469889343c724f81a2c920307e8e35f3efd91a48662378bd7bf22342b86732a
 u16LE   u8                             u8[32]
```

These identifiers are valid across chains, meaning that they can be used to refer to a token regardless of where it currently exists (in native form on its origin chain, or in wrapped form on another chain, or on the L2 ledger). Wildcard automatically resolves references to assets in a chain-agnostic manner. This chain-agnostic data model greatly simplifies the writing of robust multi-chain or many-chain dApps, without requiring any chain-specific engineering know-how.

Individual assets are represented by the `erdstall/ledger/assets.ChainAssets` type, which represents a basket of assets, grouped by their chain of origin. Individual amounts for fungibles are represented by the `erdstall/ledger/assets.Amount` type, and NFTs as `erdstall/ledger/assets.Tokens` (consisting of a list of NFT IDs within a collection). More types might get added in the future.






### The multi-chain account model



Currently, accounts are determined by the address associated with a secret key of any of the account schemes of the various supported chains.
This means that to move funds between two address-incompatible chains (such as ethereum and substrate), one first needs to transfer the funds to an account that is address-compatible with the destination chain, and then withdraw.
In the near future, addresses of multiple types can be linked together to form one multi-chain account.
Additionally, such an account will receive a short unique ID (8 bytes), which can be used within Wildcard's L2 ledger, making payments more convenient.
However, for now, each account only has a single signer and a single address.


**Balance proofs**&emsp; Balance proofs are issued at the end of each epoch to all users that currently hold a balance within Wildcard.
When the Wildcard operator fails to issue balance proofs, a user has one epoch of time to challenge the operator on-chain, forcing it to respond and post it on-chain over the following epoch.
If any challenge goes unanswered for the entire epoch in which the operator can reply, Wildcard forcefully freezes, allowing the previous epoch's (the one whose balance proofs were properly issued to everyone) balance proofs to be redeemed on-chain.
This ensures that funds are always recoverable, even if Wildcard were to be terminated forever.
Additionally, when a user requests to exit, he receives a special balance proof that is also redeemable even without a freeze.

**Owning assets for incompatible chains**&emsp; By default, all assets owned on the L2 ledger will be allocated in the recovery balance proofs to be withdrawable to their chain of origin.
In the case where an account owns assets originating on a chain that is address-incompatible with the account, the assets get allocated to the first supported address-compatible chain. In the near future, this problem will be eliminated when we have the unified account model with multiple addresses for the same account.





### Wildcard-native asset collections

Wildcard-native collections can be created via the `Mint` transaction, which receives an arbitrary 32-byte collection ID, and calculates the actual collection name within Wildcard's asset descriptor scheme by hashing the account address of the owner and the collection name.

`crypto.AssetID.erdstallUserToken(Address, Uint8Array(32))` computes the ID of a user-minted asset collection.






### Finality and security model

The Wildcard TEE reads blocks from the various connected blockchains, and only processes them once they have been deemed finalised (impossible to revert). An accepted block must never revert. For substrate, finality is pretty straight-forward and has sub-minute latency. In Ethereum, finality proofs are issued quite rarely in comparison, establishing finality for an entire batch of blocks. This causes ethereum blocks to only be processed in big bursts with long idle periods in between. This causes the Wildcard TEE to have wildly varying latencies for witnessing deposits coming from Ethereum. Deposits from substrate are mostly unaffected by this.

Wildcard tracks time in fixed-duration epochs, starting at an arbitrary starting point. At the end of each epoch, the Wildcard TEE creates a full checkpoint of the system by issuing balance proofs to all users. While correctness of execution is guaranteed via the use of TEE technology, availability is not. Should the system have a (potentially permanent) outage, we need to guarantee that all funds that are currently locked into our L2 can be released again, according to the latest system-wide snapshot.

Wildcard's snapshots don't immediately become effective, as they first need to be finalised, too. This is because if the balance proofs are not properly issued to everyone who holds funds in Wildcard, then the affected users would be unable to recover their funds out of the latest checkpoint in the worst case scenario. Thus, we have an on-chain challenging period in which users can force the Wildcard operator to publish their individual balance proofs. If the operator does not respond with a valid proof within an epoch, Wildcard halts and the last finalised checkpoint is enacted on-chain. More details on this can be found in the [:page_facing_up: CommiTEE](https://eprint.iacr.org/2020/1486) paper (although this paper was written for a single-chain setup, whereas we are operating in a multi-chain setup, which prompted substantial modifications to the security mechanism).

Unless there is an outage (intentional or unintentional), Wildcard L2 transactions _never_ revert. And even if there is an outage, transactions cannot revert beyond the latest finalised checkpoint. This gives us a hard finality latency of currently 3 epochs (the duration it takes to finalise an epoch), while under normal operations (if you trust Wildcard to operate honestly and consistently), you have a soft finality as soon as you receive a transaction receipt signed by the Wildcard TEE. We are researching more sophisticated approaches to shorten epoch durations and finality latencies without affecting security.

Wildcard's security is based on the assumption that users will challenge the operator if it fails to issue them their balance proofs on time. This essentially forces users to be always online, which is impractical, which is why we are currently reworking the balance proof and challenging system to be _atomic_ in that either all proofs get published for everyone, or nobody can use his proof. Special user-operated watcher TEEs will then take over the responsibility of keeping the operator in check, while also removing the possibility of DoS attacks via spamming lots of malicious challenges, forcing the operator to respond with lots of proofs on-chain, potentially failing to answer all of them in time due to sheer volume of challenges. The new protocol will make use of ethereum's data blobs for provable publishing of data. Due to the ongoing rework of the challenge protocol and due to the fact that SDK users will no longer be responsible for challenging, challenging is not part of the SDK's functionality.

After the rework, the new security model will be that at any moment, world-wide, at least one user-hosted watcher TEE has to be operating honestly (that is, not maliciously colluding with Wildcard's operator). Since the new mechanism relies on bundling together the proofs for users for publishing, Wildcard will probably have some kind of gossip/peer-to-peer broadcast mechanism for balance proofs to scale better.





## Using the SDK







### Connecting to Wildcard



To connect to Wildcard, we first need to select the suitable connector type from the root package (see §[Repository structure](#repository-structure)). They are constructed using the following constructor arguments (in the given order; arguments that are not present are to be completely omitted):

* `l2signer: Signer`&emsp; The account associated with the connection. Only present for `WritingApp` and `Session`. You can create it using either `erdstall/crypto/ethereum.EthereumSigner` or `erdstall/crypto/substrate.SubstrateSigner`. An ethereum signer can be created from an ethers.js `Signer` using `.fromEthersSigner()`, or via `.generateCustodialAccount()` and `.restoreCustodialAccount()`. There is not yet a way to inject a Wildcard signer in a generic way.
* `enclaveConn: URL`&emsp; The URL of the Wildcard operator. Present in all cases. We are not yet operating a public test instance. You can contact us directly if you want to gain access.
* `backendCtors`&emsp; An object injecting constructors for L1 chain connection objects. This lets you control which chains you want to connect to, and how. The intended values are the various `ChainSession.fromConfig()` (or `ChainClient.fromConfig()`, respectively) constructors that can be found on the backend-specific types found in `erdstall/ledger/backend/<ethereum|substrate>`. This field is only present for `Client` and `Session`.

**Setting up a browser dApp**&emsp; An example of how to set up a `WritingApp` using an injected ethereum signer:
```ts
import { BrowserProvider } from "ethers";
import { WritingApp } from "@polycrypt/erdstall";
import { EthereumSigner } from "@polycrypt/erdstall/crypto/ethereum";

const signer = await (new BrowserProvider(window.ethereum)).getSigner();

const wildcard = new WritingApp(
    EthereumSigner.fromEthersSigner(signer),
    new URL("ws://127.0.0.1:1337/ws"); // local Wildcard operator

await wildcard.initialize(); // connects to the operator
await wildcard.subscribe(); // subscribes to all receipts and balance proofs

// Start your dApp with the Wildcard connection
myDApp.run(wildcard);
```

**Setting up a server-side dApp**&emsp; Additionally, for example when writing a server-side application for node.js, you can set up a custodial wallet session (locally managed keys without an external signer) using the following code:

```ts
import { WritingApp } from "@polycrypt/erdstall";
import { EthereumSigner } from "@polycrypt/erdstall/crypto/ethereum";

let signer: EthereumSigner;
let privateKey = await db.load("private_key");
if(privateKey)
    signer = EthereumSigner.restoreCustodialAccount(privateKey);
else
{
    const acc = EthereumSigner.generateCustodialAccount();
    await db.save("private_key", acc.privateKey);
    signer = acc.signer;
}

const wildcard = new WritingApp(signer, wildcardURL);
```

This may be useful for running Wildcard in a setting where no external wallet provider (such as MetaMask) exists, e.g. in a node.js server or when using custodial or throwaway wallets in a website.







### Handling assets


The `AssetID` has already been explained in detail in §[The multi-chain asset model](#the-multi-chain-asset-model).
The other part of asset handling is the `ChainAssets` class. It is fairly straightforward to use. You create an empty `ChainAssets` instance via its constructor, and then add more via `.addAsset(Chain, LocalID, Asset)`, where `LocalID` is the 32-byte array part of the AssetID. This lets us construct ChainAssets in a piecewise manner and then pass them to the relevant functions. ChainAssets are a tree structure that groups assets by origin chain and by kind (fungible / NFT), but via the `.ordered()` function, a neat iterable representation `[AssetID, Asset]` is returned, which is more convenient for displaying them. 








### Deposits and withdrawing





Fungible tokens and NFTs can be deposited into our L2 network by calling `Session.deposit(assets)`. This call returns an `UnsignedTxBatch` that can then be signed with `Session.signTxBatch()` and then sent with `Session.sendTxBatch()`. Only after all those transactions are mined are the deposits successful. The assets will be available in Wildcard once the Wildcard TEE witnesses the finality of the blocks containing the respective transactions. On substrate finality is reached within well under a minute, but on Ethereum (PoS), finality proofs for blocks are issued in much sparse intervals. Around epoch boundaries, Ethereum finality does currently delay substrate block processing, though, as we can only progress into a new epoch if all blocks for that epoch on all chains have been processed.

To exit the Wildcard network with all currently held assets, call `Session.leave(dstChain)` with the desired destination chain as argument. This will first send an `exit` request to the Wildcard enclave. Once the epoch has ended, an exit proof will be issued by the operator. Due to protocol-security-related reasons, it now has wait for another two epochs before an on-chain `withdraw` transaction can be sent to the Wildcard contract. The call returns an `UnsignedTxBatch` containing the various transactions. Once all those transactions have been mined, the user's assets from the exit proof are either unlocked or minted as wrapped tokens on the specified destination chain (depending on their origin).

More fine-grained control can be exerted by directly calling `Session.exit()` and `Session.withdraw()`, but then, the caller has to take care of ensuring the delays are kept properly. That way, withdrawing only parts of your assets is also possible, but due to the complex multi-step procedure, we generally recommend using the `.leave()` function when possible.








### Account queries




The current L2 balance of any account can be queried using `App.getAccount(Address)` or `WritingApp.getOwnAccount()`. These functions both return a promise to a `ledger.Account`, which contains the current balance, latest balance proofs, and current transaction nonce on the L2 ledger.












### Event Subscriptions & Callbacks



After creating a Wildcard connection, event handlers can be set up using `.l2_events[name].on()` and `.once()`, like

```ts
app.l2_events["receipt"].on((rec) => {
    console.log(`Transaction by ${rec.tx.sender}`);
});
```

Handlers set up with `on` are persistent and are called every time the respective
event is received. `once`-handlers are only called once and then removed from
the list of handlers. Both type of handlers can also be removed by calling
`.off()`.

Once all event handlers are setup, first `await app.initialize()` to initialize the client, then `await app.subscribe()` to subscribe to all balance proofs and transaction receipts for all users, or filter to a specific user with address by calling `App.subscribe(Address)`. `WritingApp.subscribeSelf()` is a shortcut for subscribing a session to the own user.
Note that handlers can also be added or removed after the client has already been initialized and subscribed.

> [!WARNING]
> If you do not set up a subscription for your own account, you will not receive transaction receipts, even for transactions you yourself send.

<details><summary>The following <code>EnclaveEvent</code> events exist (emitted event types are written in parentheses):</summary>

-   **`"open"`** is triggered when the connection to Wildcard is established.
    This event is triggered again if the Wildcard connection is lost and automatically re-established.
    At startup, you can alternatively use `await client.initialize()` instead of setting up a handler for this event.

-   **`"config"(ClientConfig)`** is triggered when the client configuration is received from the operator after establishing the connections.

-   **`"close"`** is triggered when the connection to Wildcard is terminated due to any reason.

-   **`"error"(string | Error)`** is triggered when an error occurres within the Wildcard client.

-   **`"receipt"(TxReceipt)`** is triggered when a receipt is received from a transaction subscription.
    This does not include transaction receipts directly received as a response when issuing transactions.
    A transaction receipt contains the transaction itself and the changed balances of all affected parties.

-   **`"proof"(BalanceProof)`** is triggered when a balance proof is received from a proof subscription.

-   **`"phaseshift"`** is triggered when a phase shift in the Wildcard L2 occured, i.e., the last block of an epoch got processed by the enclave.
</details>






### Handling pending L2 transactions




All transaction commands are asynchronous because they involve signing (which might prompt a popup, if an injected signer is used) and sending of messages. They return a `PendingTransaction` the moment the transaction has been signed and sent / queued for sending. To confirm that it has been received by the operator, await `.accepted`. To access the transaction's receipt (the proof that it has been processed, as well as the result of its execution), await `.receipt`.

> [!WARNING]
> To be able to receive transaction receipts, currently, you need to make sure to have called `WritingApp.subscribeSelf()`. As part of the upcoming privacy features, we will overhaul transaction receipts and subscriptions, and then you will no longer need to call this function, as it might no longer even exist. This is still an old legacy behaviour from 4 years ago…







### Transfers


To transfer assets within Wildcard's L2 ledger, use `WritingApp.transferTo(ChainAssets, Address)`. This transaction transfers the specified assets to the specified recipient account. If the owner does not have enough funds, none are sent, and the transaction fails. If the recipient account does not yet exist, it is silently created.

> [!CAUTION]
> As is common practice in the cryptocurrency space, if you send funds to the wrong address, you cannot recover them. Sending to a non-existent account will render the funds unusable forever.








### Trading



Wildcard natively supports (basket) trading of tokens and NFTs. Currently, simple two-step offer and accept trading is supported. Some external marketplace infrastructure needs to be in place to present trade offers to potential buyers, who can then execute a trade on the Wildcard L2 without having to interact with the proposer of the trade.

A trade offer can be created using `WritingApp.createOffer(offer: ChainAssets, expect: ChainAssets)`. The returned `TradeOffer` needs the external marketplace infrastructure to reach potential buyers. An interested buyer can then execute the trade by calling `WritingApp.acceptTrade(offer)`, which will send a `Trade` transaction to the Wildcard network, atomically exchanging the assets between the two accounts.

> [!NOTE]
> This will be experimented with and reworked in the future to figure out the optimal API and functionality for non-custodial / decentralised exchange of assets.





### NFT minting


`WritingApp.mint(collection: Uint8Array(32), id: BigInt)` can be used to mint a new NFT with on-chain contract address `token` and id `id`. The NFT can then be traded freely and is only minted on-chain upon withdrawal.

> [!NOTE]
> See §[Wildcard-native asset collections](#wildcard-native-asset-collections) for more information on how the minted token is accessed.





### Token burning


You can burn tokens with a `WritingApp.burn(ChainAssets)` transaction call.

> [!WARNING]
> If the a token was deposited into Wildcard, it will not be burned on-chain, but will indefinitely be locked-up and be held by the asset holder contract. This transaction is therefore unsuitable for interacting

> [!CAUTION]
> Burning funds, well… can be dangerous. However, in the cryptocurrencies space, burning funds is seen as a legitimate and desirable act under certain circumstances. Only call this if you really intend to, and only on the assets you really want to burn. It would probably be good to separate funds into a separate account before burning them, just to make sure.





## Development

This section contains some internal notes for maintainers.

### TypedJSON

The Wildcard SDK internally uses [`TypedJSON`](https://github.com/JohnWeisz/TypedJSON) to define class JSON serialization.
If you want to use TypedJSON in your project for class serialization, possibly using some Wildcard classes as field types, you _must_ use the re-exported module `typedjson` from `@polycrypt/erdstall/export/typedjson` like

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

If you use TypedJSON to serialize your own classes and they have a field of type `bigint`, it is best to use the annotation `@jsonBigIntMember()` from `@polycrypt/erdstall/export/typedjson`, which defines a hexadecimal string serialization format.

### Contract bindings

Ethereum bindings are generated via `scripts/genbindings.sh` (usage documented inside).

Substrate bindings are not statically generated; they are fetched at runtime. 


## License

This work is released under the Apache 2.0 license. See LICENSE file for more
details.

_Copyright © 2021 – 2025 - PolyCrypt GmbH._
