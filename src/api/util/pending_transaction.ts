import { TxAccepted, TxReceipt } from "#erdstall/api/responses";

export interface PendingTransaction {
	accepted: Promise<TxAccepted>;
	receipt: Promise<TxReceipt>;
}
