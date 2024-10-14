// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { jsonObject } from "#erdstall/export/typedjson";
import { Backend, BackendChainConfig } from "#erdstall/ledger/backend";
import { EthereumChainConfig } from "#erdstall/ledger/backend/ethereum/chainconfig";
import { SubstrateChainConfig } from "#erdstall/ledger/backend/substrate/chainconfig";
import { Address, Crypto } from "#erdstall/crypto";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { Chain } from "#erdstall/ledger";
import { customJSON } from "../util";

export class ChainConfig<B extends Backend> {
	id: number;
	type: B;
	data: BackendChainConfig<B>;

	constructor(id: number, type: B, data: BackendChainConfig<B>) {
		this.id = id;
		this.type = type;
		this.data = data;
	}

	clone(): ChainConfig<B> {
		return new ChainConfig<B>(this.id, this.type, this.data!.clone());
	}

	static fromJSON(data: any): ChainConfig<Backend> {
		switch (data.type) {
			case "substrate":
				return new ChainConfig(data.id, "substrate",
					new SubstrateChainConfig(data.data.blockStreamLAddr));
			case "ethereum":
				return new ChainConfig(data.id, "ethereum",
					new EthereumChainConfig({
						contract: EthereumAddress.fromJSON(data.data.contract),
						nodeRPC: data.data.nodeRPC,
						networkID: data.data.networkID,
						powDepth: data.data.powDepth,
					}));
			default:
				throw new Error(`unknown backend type: ${data.type}`);
		}
	}

	static toJSON(me: ChainConfig<Backend>) {
		switch (me.type) {
			case "substrate": {
				const _me = me as ChainConfig<"substrate">;
				return {
					id: me.id,
					type: me.type,
					data: {
						blockStreamLAddr: _me.data.blockStreamLAddr,
					},
				};
			}
			case "ethereum": {
				const _me = me as ChainConfig<"ethereum">;
				return {
					id: me.id,
					type: me.type,
					data: {
						contract: _me.data.contract,
						networkID: _me.data.networkID,
						powDepth: _me.data.powDepth,
					},
				};
			}
		}
	}
}

const clientConfigTypeName = "ClientConfig";

@jsonObject
export class ClientConfig extends ErdstallObject {
	chains: ChainConfig<Backend>[];
	enclave: Map<Chain, Address<Crypto>>;
	enclaveNativeSigner: Address<Crypto>;

	constructor(
		chains: ChainConfig<Backend>[],
		enclave: Map<Chain, Address<Crypto>>,
		enclaveNativeSigner: Address<Crypto>,
	) {
		super();
		this.chains = chains;
		this.enclave = enclave;
		this.enclaveNativeSigner = enclaveNativeSigner;
	}

	static fromJSON(data: any): ClientConfig {
		let chains: ChainConfig<Backend>[] = [];
		for (const conf of data.chains as ChainConfig<Backend>[]) {
			chains.push(ChainConfig.fromJSON(conf));
		}
		let enc: Map<Chain, Address<Crypto>> = new Map();
		for(const key in data.enclave ?? {}) {
			enc.set(parseInt(key), Address.fromJSON(data.enclave[key]));
		}
		const native = enc.get(Chain.Erdstall)!;
		enc.delete(Chain.Erdstall);

		return new ClientConfig(chains, enc, native);
	}

	static toJSON(me: ClientConfig) {
		// NOTE: Why is this hack necessary?
		return {
			chains: me.chains.map((ccfg) => ChainConfig.toJSON(ccfg)),
		} as any;
	}

	public objectType(): any {
		return ClientConfig;
	}

	protected objectTypeName(): string {
		return clientConfigTypeName;
	}

	clone(): ClientConfig {
		return new ClientConfig(
			this.chains.map(c => c.clone()),
			new Map<Chain, Address<Crypto>>(
				Array.from(this.enclave.entries()).map(([c,addr]) => [c, addr.clone()])),
			this.enclaveNativeSigner.clone()
		);
	}
}

registerErdstallType(clientConfigTypeName, ClientConfig);
customJSON(ClientConfig);
