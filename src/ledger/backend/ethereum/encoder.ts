// SPDX-License-Identifier: Apache-2.0
"use strict";

import { BackendAddress } from "#erdstall/erdstall";
import {
	Amount,
	Asset,
	ChainAssets,
	Tokens,
} from "#erdstall/ledger/assets";
import {
	ChainProofDesc,
	EncodedChainProof,
	Encoder,
} from "#erdstall/ledger/backend/encoder";
import { Chain } from "#erdstall/ledger/chain";
import { Erdstall } from "#erdstall/ledger/backend/ethereum/contracts/contracts/Erdstall";
import { ABIEncoder } from "#erdstall/api/util";

import { packAmount, packTokens } from "./ethwrapper";

export class EthereumEncoder implements Encoder<"ethereum"> {
	encode(desc: ChainProofDesc<"ethereum">): EncodedChainProof {
		const exitValues = new Array<ChainAssets>();
		const recoveryValues = new Array<ChainAssets>();

		for (const val of desc.proofs.exit) {
			exitValues.push(val.funds);
		}

		for (const val of desc.proofs.recovery) {
			recoveryValues.push(val.funds);
		}

		const encodedExits = abiEncodeChainProofs(
			desc.epoch,
			desc.chain,
			desc.address,
			0,
			desc.proofs.exit.length + desc.proofs.recovery.length,
			true,
			exitValues,
		);

		const encodedRecoveries = abiEncodeChainProofs(
			desc.epoch,
			desc.chain,
			desc.address,
			desc.proofs.exit.length,
			desc.proofs.exit.length + desc.proofs.recovery.length,
			false,
			recoveryValues,
		);

		return {
			encodedExits,
			encodedRecoveries,
		};
	}
}

function abiEncodeChainProofs(
	epoch: bigint,
	chain: Chain,
	user: BackendAddress<"ethereum">,
	startIdx: number,
	count: number,
	exit: boolean,
	chunks: ChainAssets[],
): Uint8Array[] {
	const encoded = new Array<Uint8Array>();

	for (const [i, chunk] of chunks.entries()) {
		const id = startIdx + i;
		const [tokensAbiType, packedTokens] = packChainAssets(chunk);
		const abiChunk: Erdstall.BalanceChunkStruct = {
			epoch: epoch,
			id: id,
			count: count,
			chain: chain,
			account: user.toString(),
			exit: exit,
			tokens: packedTokens,
		};
		const enc = new ABIEncoder(
			["uint64", abiChunk.epoch],
			["uint32", abiChunk.id],
			["uint32", abiChunk.count],
			["uint16", abiChunk.chain],
			["address", abiChunk.account],
			["bool", abiChunk.exit],
			[tokensAbiType, abiChunk.tokens],
		).pack("ErdstallBalance");

		encoded.push(enc.bytes);
	}

	return encoded;
}

function packChainAssets(
	assets: ChainAssets,
): [string, Erdstall.TokenValueStruct[]] {
	const tokensAbiType = "tuple(tuple(uint16,uint8,bytes32),uint256[])[]";
	const packed = new Array<Erdstall.TokenValueStruct>();
	for (const [assetId, vals] of assets.ordered()) {
		const asset: Erdstall.AssetStruct = {
			origin: assetId.origin(),
			assetType: assetId.type(),
			localID: assetId.localID(),
		};
		const values = packAssets(vals);
		const tv: Erdstall.TokenValueStruct = {
			asset: asset,
			value: values,
		};
		packed.push(tv);
	}
	return [tokensAbiType, packed];
}

function packAssets(asset: Asset): bigint[] {
	switch (asset.typeTag()) {
		case "uint":
			return [packAmount(asset as Amount)];
		case "idset":
			return packTokens(asset as Tokens);
	}
}
