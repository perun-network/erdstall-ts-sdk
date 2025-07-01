import { TxAccepted, DirectTxReceipt } from "#erdstall/api/responses";

export interface PendingTransaction {
	accepted: Promise<void>;
	receipt: Promise<DirectTxReceipt>;
}
