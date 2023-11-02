// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonBigIntMember,
	jsonObject,
	jsonMapMember,
	jsonMember,
	MapShape,
} from "#erdstall/export/typedjson";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import * as ledger from "#erdstall/ledger";
import { Chain } from "#erdstall/ledger/chain";
import * as crypto from "#erdstall/crypto";
import { ProcessorInitReportData } from "#erdstall/ledger/backend/processor_data";
import { BackendAddress } from "#erdstall/erdstall";
import { Backend } from "#erdstall/ledger/backend";

const typeName = "AttestResponse";

@jsonObject
export class Parameters {
	@jsonBigIntMember() powDepth: bigint;
	@jsonBigIntMember() epochDuration: bigint;
	@jsonBigIntMember() initBlock: bigint;
	@jsonMember(crypto.Address) tee: crypto.Address<crypto.Crypto>;
	@jsonMember(crypto.Address) contract: crypto.Address<crypto.Crypto>;

	@jsonMapMember(String, () => crypto.Address, { shape: MapShape.OBJECT })
	tokenHolders: Map<string, crypto.Address<crypto.Crypto>>;

	@jsonMember(String) network: string;

	constructor(
		powDepth: bigint,
		epochDuration: bigint,
		initBlock: bigint,
		tee: crypto.Address<crypto.Crypto>,
		contract: crypto.Address<crypto.Crypto>,
		tokenHolders: Map<string, crypto.Address<crypto.Crypto>>,
		network: string,
	) {
		this.powDepth = powDepth;
		this.epochDuration = epochDuration;
		this.initBlock = initBlock;
		this.tee = tee;
		this.contract = contract;
		this.tokenHolders = tokenHolders;
		this.network = network;
	}
}

@jsonObject
export class AttestationReportChainData<B extends Backend> {
	@jsonMember(() => crypto.Address)
	address: BackendAddress<B>;
	@jsonMember(() => ProcessorInitReportData)
	processorData: ProcessorInitReportData<B>;
	constructor(
		address: BackendAddress<B>,
		processorData: ProcessorInitReportData<B>,
	) {
		this.address = address;
		this.processorData = processorData;
	}
}

@jsonObject
export class AttestationReportData {
	@jsonMember(Parameters) params: Parameters;
	@jsonMapMember(Number, AttestationReportChainData) chains: Map<
		Chain,
		AttestationReportChainData<Backend>
	>;
	@jsonBigIntMember() nonce: bigint;

	constructor(
		p: Parameters,
		chains: Map<Chain, AttestationReportChainData<Backend>>,
		nonce: bigint,
	) {
		this.params = p;
		this.chains = chains;
		this.nonce = nonce;
	}
}

@jsonObject
export class AttestationResult {
	@jsonMember(AttestationReportData) data: AttestationReportData;
	@jsonMember(String) report: string;

	constructor(data: AttestationReportData, report: string) {
		this.data = data;
		this.report = report;
	}
}

@jsonObject
export class AttestResponse extends ErdstallObject {
	@jsonMember(AttestationResult) attestation: AttestationResult;

	constructor(attestation: AttestationResult) {
		super();
		this.attestation = attestation;
	}

	public objectType(): any {
		return AttestResponse;
	}
	protected objectTypeName(): string {
		return typeName;
	}
}

registerErdstallType(typeName, AttestResponse);
