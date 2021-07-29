// SPDX-License-Identifier: Apache-2.0

import { Watcher } from "#erdstall";
import { Mint } from "#erdstall/api/transactions";
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

	mint(nft: {token: Address, id: bigint, owner: Address}) {
		const mintTx = new Mint(nft.owner, BigInt(0), nft.token, nft.id);
		this.txReceiptHandler(new TxReceipt(mintTx, new Account(0n, new Assets())));
	}
}

