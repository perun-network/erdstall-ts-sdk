import { Tokens } from "./assets";

export interface OnChainQuerier {
	queryTokensOwnedByAddress(token: string, address: string): Promise<Tokens>;
}
