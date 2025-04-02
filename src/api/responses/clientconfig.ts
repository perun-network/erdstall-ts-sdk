// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { jsonObject, jsonMember, AnyT, TypedJSON } from "#erdstall/export/typedjson";
import { EthereumChainConfig } from "#erdstall/ledger/backend/ethereum/chainconfig";
import { SubstrateChainConfig } from "#erdstall/ledger/backend/substrate/chainconfig";
import { Address, Crypto } from "#erdstall/crypto";
import { SubstrateAddress } from "#erdstall/crypto/substrate";
import { EthereumAddress } from "#erdstall/crypto/ethereum";
import { Chain } from "#erdstall/ledger";
import { customJSON } from "../util";

export class ChainConfig {
	id: Chain;
	data: EthereumChainConfig | SubstrateChainConfig;

	constructor(
		id: Chain,
		type: string,
		data: EthereumChainConfig | SubstrateChainConfig)
	{
		this.id = id;
		if(data.type() !== type)
			throw new Error(`Chain config: type: "${type}", should be "${data.type()}".`);
		this.data = data;
	}

	clone(): ChainConfig {
		return new ChainConfig(this.id, this.data!.type(), this.data!.clone());
	}

	static fromJSON(data: any): ChainConfig {
		switch (data.type) {
			case "substrate":
				return new ChainConfig(data.id, data.type,
					new SubstrateChainConfig(data.data.blockStreamLAddr));
			case "ethereum":
				return new ChainConfig(data.id, data.type,
					EthereumChainConfig.fromJSON(data.data));
			default:
				throw new Error(`unknown backend type: ${data.type}`);
		}
	}

	static toJSON(me: ChainConfig) {
		return {
			id: me.id,
			type: me.data.type(),
			data: me.data.toJSON()
		};
	}
}
customJSON(ChainConfig);


const clientConfigTypeName = "ClientConfig";

@jsonObject
export class ClientConfig extends ErdstallObject {
	chains: ChainConfig[];
	enclave: Map<Chain, Address>;
	enclaveNativeSigner: Address;
	genesis: Date;
	epochDuration: number;

	constructor(
		chains: ChainConfig[],
		enclave: Map<Chain, Address>,
		enclaveNativeSigner: Address,
		genesis: Date,
		epochDuration: number
	) {
		super();
		this.chains = chains;
		this.enclave = enclave;
		this.enclaveNativeSigner = enclaveNativeSigner;
		this.genesis = genesis;
		this.epochDuration = epochDuration;
	}

	static fromJSON(data: any): ClientConfig {
		let chains: ChainConfig[] = [];
		for (const conf of data.chains as any[]) {
			chains.push(ChainConfig.fromJSON(conf));
		}
		let enc: Map<Chain, Address> = new Map();
		for(const key in data.enclave ?? {}) {
			enc.set(parseInt(key), Address.fromJSON(data.enclave[key]));
		}
		const native = enc.get(Chain.Erdstall)!;
		enc.delete(Chain.Erdstall);

		// Workaround: defaulting settings for substrate.
		for(const [chain, addr] of enc) {
			if(addr instanceof SubstrateAddress) {
				if(!chains.find(c => c.id === chain))
				{
					const chainCfg = new ChainConfig(
						chain, "substrate",
						new SubstrateChainConfig(
							"wss://zombienet.perun.network:9999"));
					chains.push(chainCfg);
				}
			}
		}

		const genesis = new Date(data.genesis);
		const epochDuration = Number(BigInt(data.epochDuration) / 1_000_000_000n);

		return new ClientConfig(chains, enc, native, genesis, epochDuration);
	}

	static toJSON(me: ClientConfig): any
	{
		let enclave: any = {};
		for(let [chain, addr] of me.enclave.entries())
			enclave[chain] = Address.toJSON(addr);
		return {
			chains: me.chains.map(ChainConfig.toJSON),
			enclave,
			enclaveNativeSigner: Address.toJSON(me.enclaveNativeSigner),
			genesis: me.genesis.toISOString(),
			epochDuration: me.epochDuration * 1_000_000_000
		};
	}

	public objectType(): any {
		return ClientConfig;
	}

	override objectTypeName(): string {
		return clientConfigTypeName;
	}

	clone(): ClientConfig {
		return new ClientConfig(
			this.chains.map(c => c.clone()),
			new Map<Chain, Address<Crypto>>(
				Array.from(this.enclave.entries()).map(([c,addr]) => [c, addr.clone()])),
			this.enclaveNativeSigner.clone(),
			this.genesis,
			this.epochDuration
		);
	}
}

registerErdstallType(clientConfigTypeName, ClientConfig);
customJSON(ClientConfig);
