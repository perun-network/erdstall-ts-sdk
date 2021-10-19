// SPDX-License-Identifier: Apache-2.0

import { ErdstallClient, Watcher } from "#erdstall";
import {
	Mint,
	Trade,
	Transfer,
	Burn,
	ExitRequest,
} from "#erdstall/api/transactions";
import {
	TxReceipt,
	BalanceProof,
	BalanceProofs,
	ClientConfig,
	Account as RAccount,
} from "#erdstall/api/responses";
import { TypedJSON } from "typedjson";
import { Result, Call, ErdstallObject } from "#erdstall/api";
import {
	SubscribeTXs,
	SubscribeBalanceProofs,
	GetAccount,
} from "#erdstall/api/calls";
import { Transaction } from "#erdstall/api/transactions";
import { BigInteger } from "#erdstall/api/util";
import { Address, Account, ErdstallEvent } from "#erdstall/ledger";
import {
	NFTMetadata,
	TokenFetcher,
	TokenProvider,
} from "#erdstall/ledger/backend";
import { Assets, Tokens } from "#erdstall/ledger/assets";
import { EnclaveEvent, EnclaveProvider } from "#erdstall/enclave";

export class MockWatcher implements Watcher {
	private txReceiptHandler!: (tx: TxReceipt) => void;
	private exitProofHandler!: (p: BalanceProof) => void;
	private balanceProofHandler!: (p: BalanceProof) => void;
	private phaseShiftHandler!: () => void;

	// eslint-disable-next-line @typescript-eslint/ban-types
	on(ev: ErdstallEvent | EnclaveEvent, cb: Function): void {
		switch (ev) {
			case "receipt":
				this.txReceiptHandler = cb as (_rec: TxReceipt) => void;
				break;
			case "proof":
				this.balanceProofHandler = cb as (_bp: BalanceProof) => void;
				break;
			case "exitproof":
				this.exitProofHandler = cb as (_ep: BalanceProof) => void;
				break;
			case "phaseshift":
				this.phaseShiftHandler = cb as () => void;
				break;
			default:
				throw new Error(`MockWatcher: unsupported event "${ev}"`);
		}
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	once(_ev: ErdstallEvent | EnclaveEvent, _cb: Function): void {
		throw new Error("not implemented");
	}
	// eslint-disable-next-line @typescript-eslint/ban-types
	off(_ev: ErdstallEvent | EnclaveEvent, _cb: Function): void {
		throw new Error("not implemented");
	}

	mint(nft: {
		token: Address;
		id: bigint | BigInteger;
		owner: Address;
	}): void {
		const mintTx = new Mint(
			nft.owner,
			BigInt(0),
			nft.token,
			nft.id.valueOf(),
		);
		this.txReceiptHandler(
			new TxReceipt(mintTx, new Map<string, Account>()),
		);
	}

	burn(burnTx: Burn): void {
		this.txReceiptHandler(
			new TxReceipt(burnTx, new Map<string, Account>()),
		);
	}

	trade(tradeTx: Trade): void {
		this.txReceiptHandler(
			new TxReceipt(tradeTx, new Map<string, Account>()),
		);
	}

	transfer(tx: Transfer): void {
		this.txReceiptHandler(new TxReceipt(tx, new Map<string, Account>()));
	}

	phaseshift(bps: BalanceProofs) {
		for (let bp of bps.map.values()) {
			if (bp.balance.exit) this.exitProofHandler(bp);
			else this.balanceProofHandler(bp);
		}
		this.phaseShiftHandler();
	}
}

export class MockClient extends MockWatcher implements ErdstallClient {
	readonly tokenProvider: TokenProvider;
	private readonly contract: Address;
	private metadata: Map<string, NFTMetadata>;

	constructor(contract: Address) {
		super();
		this.contract = contract;
		this.metadata = new Map();
		this.tokenProvider = new TokenFetcher();
	}

	async initialize(): Promise<void> {}
	async subscribe(_who?: Address): Promise<void> {}
	async getAccount(_who: Address): Promise<Account> {
		throw new Error("cannot query accounts on mock clients");
	}

	setMetadata(token: Address, id: bigint, metadata: NFTMetadata): void {
		this.metadata.set(`${token}:${id}`, metadata);
	}

	async getNftMetadata(token: Address, id: bigint): Promise<NFTMetadata> {
		const res = this.metadata.get(`${token}:${id}`);
		if (!res) {
			return Promise.reject(new Error(`no metadata for ${token}:${id}`));
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
	private config?: ClientConfig;

	constructor(config?: ClientConfig) {
		this.onopen = null;
		this.onclose = null;
		this.onerror = null;
		this.onmessage = null;
		this.config = config;
	}

	public connect() {
		if (!this.config) return;

		const msg = newErdstallMessageEvent(new Result(undefined, this.config));
		return this.onmessage!(msg);
	}

	public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
		const call = TypedJSON.parse(data, Call)!;

		switch (call.data.objectType()) {
			case SubscribeTXs: {
				const msg = newErdstallMessageEvent(new Result(call.id));
				return this.onmessage!(msg);
			}
			case SubscribeBalanceProofs: {
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
				const acc = new Account(
					txc.nonce.valueOf(),
					txc.values,
					new Assets(),
				);

				const res = newTxReceiptResult(id, tx, acc);
				const msg = newErdstallMessageEvent(res);
				return this.onmessage!(msg);
			}
			case Mint: {
				const txc = tx as Mint;
				const assets = new Assets();
				assets.addAsset(
					txc.token.toString(),
					new Tokens([txc.id.valueOf()]),
				);
				const acc = new Account(
					txc.nonce.valueOf(),
					assets,
					new Assets(),
				);

				const res = newTxReceiptResult(id, tx, acc);
				const msg = newErdstallMessageEvent(res);
				return this.onmessage!(msg);
			}
			case ExitRequest: {
				const res = newTxReceiptResult(id, tx);
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
	acc?: Account,
): Result {
	const _acc = acc
		? acc
		: new Account(tx.nonce.valueOf(), new Assets(), new Assets());
	const delta = new Map<string, Account>([[tx.sender.key, _acc]]);
	const txr = new TxReceipt(tx, delta);
	return new Result(id, txr);
}
