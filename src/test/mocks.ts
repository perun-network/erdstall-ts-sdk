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
import { Result, Call, ErdstallObject, Signature } from "#erdstall/api";
import {
	SubscribeTXs,
	SubscribeBalanceProofs,
	SubscribePhaseShifts,
	GetAccount,
} from "#erdstall/api/calls";
import { Transaction } from "#erdstall/api/transactions";
import { Address, Account, OnChainQuerier } from "#erdstall/ledger";
import {
	NFTMetadata,
	TokenFetcher,
	TokenProvider,
} from "#erdstall/ledger/backend";
import { Assets, Tokens } from "#erdstall/ledger/assets";
import { EnclaveProvider } from "#erdstall/enclave";

export class MockWatcher implements Watcher {
	private txReceiptHandler!: ErdstallEventHandler<"receipt">;
	private exitProofHandler!: ErdstallEventHandler<"exitproof">;
	private balanceProofHandler!: ErdstallEventHandler<"proof">;
	private phaseShiftHandler!: ErdstallEventHandler<"phaseshift">;

	on<T extends ErdstallEvent>(ev: T, cb: ErdstallEventHandler<T>): void {
		switch (ev) {
			case "receipt":
				this.txReceiptHandler = cb as ErdstallEventHandler<"receipt">;
				break;
			case "proof":
				this.balanceProofHandler = cb as ErdstallEventHandler<"proof">;
				break;
			case "exitproof":
				this.exitProofHandler = cb as ErdstallEventHandler<"exitproof">;
				break;
			case "phaseshift":
				this.phaseShiftHandler =
					cb as ErdstallEventHandler<"phaseshift">;
				break;
			default:
				throw new Error(`MockWatcher: unsupported event "${ev}"`);
		}
	}

	once<T extends ErdstallEvent>(_ev: T, _cb: ErdstallEventHandler<T>): void {
		throw new Error("not implemented");
	}
	off<T extends ErdstallEvent>(_ev: T, _cb: ErdstallEventHandler<T>): void {
		throw new Error("not implemented");
	}
	removeAllListeners(): void {
		throw new Error("not implemented");
	}

	async mint(
		nft: {
			token: Address;
			id: bigint;
			owner: Address;
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
					new Signature(new Uint8Array()),
					"",
				),
			),
		);
	}

	async phaseshift(bps: BalanceProofs, ps: PhaseShift): Promise<void> {
		return Promise.all(
			Array.from(bps.map, ([_acc, bp]) => {
				return bp.balance.exit
					? this.exitProofHandler(bp)
					: this.balanceProofHandler(bp);
			}),
		).then(() => this.phaseShiftHandler(ps));
	}
}

export class MockClient extends MockWatcher implements ErdstallClient {
	readonly tokenProvider: TokenProvider;
	readonly onChainQuerier: OnChainQuerier;
	private readonly contract: Address;
	private metadata: Map<string, NFTMetadata>;

	constructor(contract: Address) {
		super();
		this.contract = contract;
		this.metadata = new Map();
		this.tokenProvider = new TokenFetcher();
		this.onChainQuerier = new MockOnChainQuerier();
	}

	async initialize(): Promise<void> {}
	async subscribe(_who?: Address): Promise<void> {}
	async getAccount(_who: Address): Promise<Account> {
		throw new Error("cannot query accounts on mock clients");
	}
	async attest(): Promise<AttestationResult> {
		throw new Error("cannot query attestation on mock clients");
	}

	setMetadata(token: Address, id: bigint, metadata: NFTMetadata): void {
		this.metadata.set(`${token.key}:${id}`, metadata);
	}

	async getNftMetadata(token: Address, id: bigint): Promise<NFTMetadata> {
		const res = this.metadata.get(`${token.key}:${id}`);
		if (!res) {
			return Promise.reject(
				new Error(`no metadata for ${token.key}:${id}`),
			);
		}
		return res;
	}

	erdstall(): Address {
		return this.contract;
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
				const acc = new Account(0n, new Assets(), new Assets());
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
				const acc = new Account(txc.nonce, txc.values, new Assets());

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
				const assets = new Assets();
				assets.addAsset(txc.token.toString(), new Tokens([txc.id]));
				const acc = new Account(txc.nonce, assets, new Assets());

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
	const _acc = acc ? acc : new Account(tx.nonce, new Assets(), new Assets());
	const delta = new Map<string, Account>([[tx.sender.key, _acc]]);
	const txr = new TxReceipt(
		tx,
		delta,
		status,
		output,
		new Signature(new Uint8Array()),
		"",
	);
	return new Result(id, txr);
}

class MockOnChainQuerier implements OnChainQuerier {
	constructor() {}
	async queryTokensOwnedByAddress(
		_token: string,
		_address: string,
	): Promise<Tokens> {
		return new Tokens([]);
	}
}
