import { TxReceipt } from "#erdstall/api/responses";

export class ReceiptDispatcher {
	private pendingReceiptDispatchers: Map<string, (value: TxReceipt) => void>;

	constructor() {
		this.pendingReceiptDispatchers = new Map<
			string,
			(value: TxReceipt) => void
		>();
	}

	register(hash: string): Promise<TxReceipt> {
		const pendingReceipt = new Promise<TxReceipt>((resolve, _reject) => {
			this.pendingReceiptDispatchers.set(hash, resolve);
		});
		return pendingReceipt;
	}

	watch(receipt: TxReceipt): void {
		const hash = receipt.tx.hash();
		const dispatch = this.pendingReceiptDispatchers.get(hash);
		if (dispatch) {
			dispatch(receipt);
		}
	}
}
