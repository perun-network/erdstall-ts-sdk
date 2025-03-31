// SPDX-License-Identifier: Apache-2.0
"use strict";

import { EthereumAddress } from "#erdstall/crypto/ethereum";
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
import { Chain } from "#erdstall/ledger";
import { Erdstall } from "#erdstall/ledger/backend/ethereum/contracts/contracts/Erdstall";
import { ABIEncoder } from "#erdstall/api/util";

import { encodePackedAssets } from "./ethwrapper";

export class EthereumEncoder implements Encoder {
	encode(desc: ChainProofDesc): EncodedChainProof {
		const exitValues = new Array<ChainAssets>();
		const recoveryValues = new Array<ChainAssets>();

		if(!(desc.address instanceof EthereumAddress))
			throw new Error("wrong address type in balance proof");
		let addr = desc.address.toString();

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
	user: EthereumAddress,
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
): [string, any[]] {
	const tokensAbiType = "tuple(tuple(uint16,uint8,bytes32),uint256[])[]";
	const packed = encodePackedAssets(assets);
	return [tokensAbiType, packed.map(tv => [[
		tv.asset.origin,
		tv.asset.assetType,
		tv.asset.localID,
		], tv.value])];
}