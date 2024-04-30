// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { jsonObject } from "#erdstall/export/typedjson";
import { Backend, BackendChainConfig } from "#erdstall/ledger/backend";
import { Address, Crypto } from "#erdstall/crypto";
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

	static fromJSON(data: any): ChainConfig<Backend> {
		const d = JSON.parse(data);
		switch (d.type) {
			case "substrate":
				return new ChainConfig(data.id, "substrate", {
					blockStreamLAddr: d.data.blockStreamLAddr,
				});
			case "ethereum":
				return new ChainConfig(d.id, "ethereum", {
					contract: d.data.contract,
					networkID: d.data.networkID,
					powDepth: d.data.powDepth,
				});
			default:
				throw new Error(`unknown backend type: ${d.type}`);
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
			chains.push(ChainConfig.fromJSON(JSON.stringify(conf)));
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
}

registerErdstallType(clientConfigTypeName, ClientConfig);
customJSON(ClientConfig);
