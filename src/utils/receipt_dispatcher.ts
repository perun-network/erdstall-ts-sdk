import { TxReceipt } from "#erdstall/api/responses";
import { LedgerReader, LedgerWriter } from "#erdstall/ledger";

export class ReceiptDispatcher {
	private pendingReceiptDispatchers: Map<string, (value: TxReceipt) => void>;

	erdstallConn?: LedgerReader | LedgerWriter;

	constructor(erdstallConn?: LedgerReader | LedgerWriter) {
		this.pendingReceiptDispatchers = new Map<
			string,
			(value: TxReceipt) => void
		>();
		this.erdstallConn = erdstallConn;
	}

	register(hash: string): Promise<TxReceipt> {
		const pendingReceipt = new Promise<TxReceipt>((resolve, reject) => {
			this.pendingReceiptDispatchers.set(hash, resolve);
		});
		return pendingReceipt;
	}

	watch(receipt: TxReceipt): void {
		if (!this.erdstallConn) return;
		const hash = receipt.tx.hash();
		const dispatch = this.pendingReceiptDispatchers.get(hash);
		if (dispatch) {
			dispatch(receipt);
		}
	}
}
