import { Tokens } from "./assets";
import { Backend, RequestedBackends } from "#erdstall/ledger/backend/backends";

export interface OnChainQuerier<Bs extends Backend[]> {
	// Query the tokens owned by an address on the given backends.
	queryTokensOwnedByAddress<B extends RequestedBackends<Bs>>(
		backend: B | B[],
		token: string,
		address: string,
	): Promise<Tokens>;
}
