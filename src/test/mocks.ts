// SPDX-License-Identifier: Apache-2.0

import {
	ErdstallClient,
	Watcher,
	ErdstallEvent,
	ErdstallEventHandler,
} from "#erdstall";
import {
	Mint,
	Trade,
	Transfer,
	Burn,
	ExitRequest,
	TransactionOutput,
} from "#erdstall/api/transactions";
import {
	TxReceipt,
	BalanceProofs,
	PhaseShift,
	ClientConfig,
	Account as RAccount,
	TxStatusCode,
	AttestationResult,
} from "#erdstall/api/responses";
import { TypedJSON } from "#erdstall/export/typedjson";
import { Result, Call, ErdstallObject } from "#erdstall/api";
import {
	SubscribeTXs,
	SubscribeBalanceProofs,
	SubscribePhaseShifts,
	GetAccount,
} from "#erdstall/api/calls";
import { Transaction } from "#erdstall/api/transactions";
import { Address } from "#erdstall/crypto";
import { EthereumSignature, EthereumAddress } from "#erdstall/crypto/ethereum";
import { Account, OnChainQuerier } from "#erdstall/ledger";
import { NFTMetadata, TokenProvider } from "#erdstall/ledger/backend";
import { TokenFetcher } from "#erdstall/ledger/backend/ethereum";
import { ChainAssets, Tokens } from "#erdstall/ledger/assets";
import { EnclaveProvider } from "#erdstall/enclave";

export class MockWatcher implements Watcher<["ethereum"]> {
	private txReceiptHandler!: ErdstallEventHandler<"receipt", "ethereum">;
	private exitProofHandler!: ErdstallEventHandler<"exitproof", "ethereum">;
	private balanceProofHandler!: ErdstallEventHandler<"proof", "ethereum">;
	private phaseShiftHandler!: ErdstallEventHandler<"phaseshift", "ethereum">;

	on<T extends ErdstallEvent>(
		ev: T,
		cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		switch (ev) {
			case "receipt":
				this.txReceiptHandler = cb as ErdstallEventHandler<
					"receipt",
					"ethereum"
				>;
				break;
			case "proof":
				this.balanceProofHandler = cb as ErdstallEventHandler<
					"proof",
					"ethereum"
				>;
				break;
			case "exitproof":
				this.exitProofHandler = cb as ErdstallEventHandler<
					"exitproof",
					"ethereum"
				>;
				break;
			case "phaseshift":
				this.phaseShiftHandler = cb as ErdstallEventHandler<
					"phaseshift",
					"ethereum"
				>;
				break;
			default:
				throw new Error(`MockWatcher: unsupported event "${ev}"`);
		}
	}

	once<T extends ErdstallEvent>(
		_ev: T,
		_cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		throw new Error("not implemented");
	}
	off<T extends ErdstallEvent>(
		_ev: T,
		_cb: ErdstallEventHandler<T, "ethereum">,
	): void {
		throw new Error("not implemented");
	}
	removeAllListeners(): void {
		throw new Error("not implemented");
	}

	async mint(
		nft: {
			token: Uint8Array;
			id: bigint;
			owner: Address<"ethereum">;
		},
		deltas?: Map<string, Account>,
	): Promise<void> {
		const mintTx = new Mint(nft.owner, BigInt(0), nft.token, nft.id);
		return this.transact(mintTx, deltas);
	}

	async burn(burnTx: Burn, deltas?: Map<string, Account>): Promise<void> {
		return this.transact(burnTx, deltas);
	}

	async trade(tradeTx: Trade, deltas?: Map<string, Account>): Promise<void> {
		return this.transact(tradeTx, deltas);
	}

	async transfer(tx: Transfer, deltas?: Map<string, Account>): Promise<void> {
		return this.transact(tx, deltas);
	}

	private async transact(
		tx: Transaction,
		deltas?: Map<string, Account>,
	): Promise<void> {
		return Promise.resolve(
			this.txReceiptHandler(
				new TxReceipt(
					tx,
					deltas ?? new Map<string, Account>(),
					1,
					new TransactionOutput(new Uint8Array()),
					new EthereumSignature(
						new Uint8Array(),
					),
					"",
				),
			),
		);
	}

	async phaseshift(bps: BalanceProofs, ps: PhaseShift): Promise<void> {
		throw new Error("not implemented");
		// return Promise.all(
		// 	Array.from(bps.map, ([_acc, bp]) => {
		// 		return bp.balance.exit
		// 			? this.exitProofHandler(bp)
		// 			: this.balanceProofHandler(bp);
		// 	}),
		// ).then(() => this.phaseShiftHandler(ps));
	}
}

export class MockClient
	extends MockWatcher
	implements ErdstallClient<["ethereum"]>
{
	readonly tokenProvider: TokenProvider<"ethereum">;
	readonly onChainQuerier: OnChainQuerier<"ethereum">;
	private metadata: Map<string, NFTMetadata>;

	constructor() {
		super();
		this.metadata = new Map();
		this.tokenProvider = new TokenFetcher();
		this.onChainQuerier = new MockOnChainQuerier();
	}

	async initialize(): Promise<void> {}
	async subscribe(_who?: Address<"ethereum">): Promise<void> {}
	async getAccount(_who: Address<"ethereum">): Promise<Account> {
		throw new Error("cannot query accounts on mock clients");
	}
	async attest(): Promise<AttestationResult> {
		throw new Error("cannot query attestation on mock clients");
	}

	setMetadata(
		token: Address<"ethereum">,
		id: bigint,
		metadata: NFTMetadata,
	): void {
		this.metadata.set(`${token.key}:${id}`, metadata);
	}

	async getNftMetadata(
		_backend: "ethereum",
		token: Address<"ethereum">,
		id: bigint,
	): Promise<NFTMetadata> {
		const res = this.metadata.get(`${token.key}:${id}`);
		if (!res) {
			return Promise.reject(
				new Error(`no metadata for ${token.key}:${id}`),
			);
		}
		return res;
	}

	erdstall(): {
		chain: "ethereum";
		address: Address<"ethereum">;
	}[] {
		throw new Error("not implemented");
		//		return this.contract;
	}
}

export class EnclaveMockProvider implements EnclaveProvider {
	public onopen: ((ev: Event) => any) | null;
	public onclose: ((ev: CloseEvent) => any) | null;
	public onerror: ((ev: Event) => any) | null;
	public onmessage: ((ev: MessageEvent) => any) | null;
	public oncall: ((ev: Call) => any) | null;
	private config?: ClientConfig;

	constructor(config?: ClientConfig) {
		this.onopen = null;
		this.onclose = null;
		this.onerror = null;
		this.onmessage = null;
		this.oncall = null;
		this.config = config;
	}

	public connect() {
		this.onopen!({} as Event);
		if (!this.config) return;

		const msg = newErdstallMessageEvent(new Result(undefined, this.config));
		return this.onmessage!(msg);
	}

	public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		const call = TypedJSON.parse(data, Call)!;
		this.oncall?.(call);

		switch (call.data.objectType()) {
			case SubscribeTXs: {
				const msg = newErdstallMessageEvent(new Result(call.id));
				return this.onmessage!(msg);
			}
			case SubscribeBalanceProofs: {
				const msg = newErdstallMessageEvent(new Result(call.id));
				return this.onmessage!(msg);
			}
			case SubscribePhaseShifts: {
				const msg = newErdstallMessageEvent(new Result(call.id));
				return this.onmessage!(msg);
			}
			case GetAccount: {
				const acc = new Account(
					0n,
					new ChainAssets(new Map()),
					new ChainAssets(new Map()),
				);
				const racc = new RAccount(acc, 0n);
				const msg = newErdstallMessageEvent(new Result(call.id, racc));
				return this.onmessage!(msg);
			}
			case Transaction: {
				return this.respondToTX(call.id, call.data as Transaction);
			}
			default:
				throw new Error("message not implemented");
		}
	}

	private respondToTX(id: string, tx: Transaction) {
		switch (tx.txType()) {
			case Transfer: {
				const txc = tx as Transfer;
				const acc = new Account(txc.nonce, txc.values);

				const res = newTxReceiptResult(
					id,
					tx,
					new TransactionOutput(new Uint8Array()),
					acc,
				);
				const msg = newErdstallMessageEvent(res);
				return this.onmessage!(msg);
			}
			case Mint: {
				const txc = tx as Mint;
				const assets = new ChainAssets(new Map());
				throw new Error("IMPLEMENT REST");
				// TODO: add asset to assets
				// assets.addAsset(txc.token.toString(), new Tokens([txc.id]));
				const acc = new Account(
					txc.nonce,
					assets,
					new ChainAssets(new Map()),
				);

				const res = newTxReceiptResult(
					id,
					tx,
					new TransactionOutput(new Uint8Array()),
					acc,
				);
				const msg = newErdstallMessageEvent(res);
				return this.onmessage!(msg);
			}
			case ExitRequest: {
				const res = newTxReceiptResult(
					id,
					tx,
					new TransactionOutput(new Uint8Array()),
				);
				const msg = newErdstallMessageEvent(res);
				return this.onmessage!(msg);
			}
			default:
				throw new Error("transaction not implemented");
		}
	}

	public sendToClient(obj?: ErdstallObject, id?: string, error?: string) {
		return this.onmessage!(
			new MessageEvent("erdstall", {
				data: TypedJSON.stringify(new Result(id, obj, error), Result),
			}),
		);
	}

	public close() {}
}

function newErdstallMessageEvent(res: Result): MessageEvent {
	const data = TypedJSON.stringify(res, Result);
	return new MessageEvent("erdstall", { data: data });
}

function newTxReceiptResult(
	id: string,
	tx: Transaction,
	output: TransactionOutput,
	acc?: Account,
	status: TxStatusCode = 1,
): Result {
	const _acc = acc
		? acc
		: new Account(
				tx.nonce,
				new ChainAssets(new Map()),
				new ChainAssets(new Map()),
		  );
	const delta = new Map<string, Account>([[tx.sender.key, _acc]]);
	const txr = new TxReceipt(
		tx,
		delta,
		status,
		output,
		new EthereumSignature(
			new Uint8Array(),
		),
		"",
	);
	return new Result(id, txr);
}

class MockOnChainQuerier implements OnChainQuerier<"ethereum"> {
	constructor() {}
	async queryTokensOwnedByAddress(
		_backend: "ethereum",
		_token: string,
		_address: string,
	): Promise<Tokens> {
		return new Tokens([]);
	}
}
