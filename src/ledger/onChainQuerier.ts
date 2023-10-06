import { Tokens } from "./assets";
import { Backend } from "#erdstall/ledger/backend/backends";

export interface OnChainQuerier<B extends Backend> {
	// Query the tokens owned by an address on the given backends.
	queryTokensOwnedByAddress<CB extends B>(
		backend: CB,
		token: string,
		address: string,
	): Promise<Tokens>;
}
