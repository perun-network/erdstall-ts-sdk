// SPDX-License-Identifier: Apache-2.0

import { ErdstallClient, Watcher } from "#erdstall";
import { Mint, Trade } from "#erdstall/api/transactions";
import { TxReceipt } from "#erdstall/api/responses";
import { Address, Account, ErdstallEvent } from "#erdstall/ledger";
import { Assets } from "#erdstall/ledger/assets";
import { EnclaveEvent } from "#erdstall/enclave";

export class MockWatcher implements Watcher {
	private txReceiptHandler!: (tx: TxReceipt) => void;

	// eslint-disable-next-line @typescript-eslint/ban-types
	on(ev: ErdstallEvent | EnclaveEvent, cb: Function): void {
		if (ev != "receipt") {
			throw new Error("MockWatcher only supports tx receipts");
		}

		this.txReceiptHandler = cb as (_rec: TxReceipt) => void;
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	once(_ev: ErdstallEvent | EnclaveEvent, _cb: Function): void {
		throw new Error("not implemented");
	}
	// eslint-disable-next-line @typescript-eslint/ban-types
	off(_ev: ErdstallEvent | EnclaveEvent, _cb: Function): void {
		throw new Error("not implemented");
	}

	mint(nft: {token: Address, id: bigint, owner: Address}): void {
		const mintTx = new Mint(nft.owner, BigInt(0), nft.token, nft.id);
		this.txReceiptHandler(new TxReceipt(mintTx, new Account(0n, new Assets())));
	}

	trade(tradeTx: Trade): void {
		this.txReceiptHandler(new TxReceipt(tradeTx, new Account(0n, new Assets())));
	}
}

export class MockClient extends MockWatcher implements ErdstallClient {
	private readonly contract: Address;

	constructor(contract: Address) {
		super();
		this.contract = contract;
	}

	async initialize(): Promise<void> {}
	async subscribe(_who?: Address):Promise<void> {}

	erdstall(): Address {
		return this.contract;
	}
}
