// SPDX-License-Identifier: Apache-2.0

import { ErdstallClient, Watcher } from "#erdstall";
import { Mint, Trade, Transfer, Burn } from "#erdstall/api/transactions";
import {
	TxReceipt,
	BalanceProof,
	BalanceProofs,
} from "#erdstall/api/responses";
import { Address, Account, ErdstallEvent } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { EnclaveEvent } from "#erdstall/enclave";

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

	mint(nft: { token: Address; id: bigint; owner: Address }): void {
		const mintTx = new Mint(nft.owner, BigInt(0), nft.token, nft.id);
		this.txReceiptHandler(
			new TxReceipt(mintTx, new Account(0n, new Assets())),
		);
	}

	burn(burnTx: Burn): void {
		this.txReceiptHandler(
			new TxReceipt(burnTx, new Account(0n, new Assets())),
		);
	}

	trade(tradeTx: Trade): void {
		this.txReceiptHandler(
			new TxReceipt(tradeTx, new Account(0n, new Assets())),
		);
	}

	transfer(tx: Transfer): void {
		this.txReceiptHandler(new TxReceipt(tx, new Account(0n, new Assets())));
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
	private readonly contract: Address;

	constructor(contract: Address) {
		super();
		this.contract = contract;
	}

	async initialize(): Promise<void> {}
	async subscribe(_who?: Address): Promise<void> {}
	async getAccount(_who: Address): Promise<Account> {
		throw new Error("cannot query accounts on mock clients");
	}

	erdstall(): Address {
		return this.contract;
	}
}
