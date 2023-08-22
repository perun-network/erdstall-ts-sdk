import { providers, Signer } from "ethers";

import { IERC721__factory } from ".";
import { Tokens } from "#erdstall/ledger/assets";

import { OnChainQuerier } from "#erdstall/ledger";

export class EthereumOnChainQuerier implements OnChainQuerier<["ethereum"]> {
	readonly provider: providers.Provider | Signer;

	constructor(provider: providers.Provider | Signer) {
		this.provider = provider;
	}

	async queryTokensOwnedByAddress(
		_backend: "ethereum" | "ethereum"[],
		token: string,
		address: string,
	): Promise<Tokens> {
		const erc721 = IERC721__factory.connect(token, this.provider);
		const outboundFilter = erc721.filters.Transfer(address, null, null);
		const inboundFilter = erc721.filters.Transfer(null, address, null);
		const [outbound, inbound] = await Promise.all([
			erc721.queryFilter(outboundFilter),
			erc721.queryFilter(inboundFilter),
		]);

		const ownershipHistory = [
			...outbound.map((tx) => ({ ...tx, owned: false })),
			...inbound.map((tx) => ({ ...tx, owned: true })),
		];
		ownershipHistory.sort((x, y): number => {
			const blockDiff = x.blockNumber - y.blockNumber;
			return blockDiff === 0
				? x.transactionIndex - y.transactionIndex
				: blockDiff;
		});

		const tokenOwnedMemo = new Map<bigint, boolean>();

		for (const entry of ownershipHistory) {
			tokenOwnedMemo.set(entry.args.tokenId.toBigInt(), entry.owned);
		}

		const ownedTokens = [];
		for (let [token, isOwned] of tokenOwnedMemo.entries()) {
			if (isOwned) ownedTokens.push(token);
		}
		return new Tokens(ownedTokens);
	}
}
