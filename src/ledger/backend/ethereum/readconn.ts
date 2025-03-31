// SPDX-License-Identifier: Apache-2.0
"use strict";

import { AssetID, AssetType, Address } from "#erdstall/crypto";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { Chain, LedgerEvent } from "#erdstall/ledger";
import { LedgerEventMask, LedgerEventEmitters } from "#erdstall/event";
import { LocalAsset } from "#erdstall/ledger/assets";
import { Erdstall } from "./contracts/contracts/Erdstall";
import { IERC721Metadata__factory } from "./contracts";
import { wrapLedgerEvent } from "./ethwrapper";
import { EthereumTokenProvider } from "./tokencache";

export const ErrUnsupportedLedgerEvent = new Error(
	"unsupported ledger event encountered",
);
export const ErrErdstallContractNotConnected = new Error(
	"erdstall contract not connected",
);

export class LedgerReadConn
{
	readonly contract: Erdstall;
	readonly tokenCache: EthereumTokenProvider;
	#chain: Chain;
	// for on/off removal.
	#ledger_event_handlers: Record<string, (...data:any) => void>;
	#last_mask?: LedgerEventMask;
	#emitters: LedgerEventEmitters;

	constructor(
		contract: Erdstall,
		tokenCache: EthereumTokenProvider,
		emitters: LedgerEventEmitters
	) {
		this.contract = contract;
		this.tokenCache = tokenCache;
		this.tokenCache.fetch_holders(this.contract);
		this.#emitters = emitters;
		this.#chain = this.tokenCache.chain;

		const handler = (name: keyof LedgerEventMask) => (...data: any) => {
			const wrapped: LedgerEvent | undefined =
				wrapLedgerEvent(name, this.#chain, ...data);
			if(wrapped)
				this.#emitters[name].emit(wrapped as any);
		};
		this.#ledger_event_handlers = {
			Frozen: handler("Frozen"),
			Deposited: handler("Deposited"),
			Withdrawn: handler("Withdrawn"),
			Challenged: handler("Challenged"),
			ChallengeResponded: handler("ChallengeResponded")
		};
	}

	update_event_tracking(mask: LedgerEventMask): void {
		for(let [k, v] of Object.entries(mask))
			if(((this.#last_mask as any)?.[k] ?? false) !== v) {
				if(v) this.#turn_on(k);
				else this.#turn_off(k);
			}
		this.#last_mask = Object.assign({}, mask);
	}

	#turn_on(event: string) {
		this.contract.on(
			(this.contract.filters as any)[event],
			(this.#ledger_event_handlers as any)[event]);
	}

	#turn_off(event: string) {
		this.contract.off(
			(this.contract.filters as any)[event],
			(this.#ledger_event_handlers as any)[event]);
	}

	removeAllListeners(): void
		{ this.contract.removeAllListeners(); }

	async getWrappedToken(token: AssetID): Promise<EthereumAddress | undefined> {
		const provider = this.contract.runner!.provider!;
		switch(token.type())
		{
		default: throw new Error(`unhandled token type ${token.type()}!`);
		case AssetType.Fungible:
		{
			return await this.tokenCache.getWrappedFungible(provider,
				token.origin(), new LocalAsset(token.localID()));
		}
		case AssetType.NFT:
		{
			return await this.tokenCache.getWrappedNFT(provider,
				token.origin(), new LocalAsset(token.localID()));
		}
		}
	}
}
