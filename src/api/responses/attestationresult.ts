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

const typeName = "AttestResponse";

@jsonObject
export class Parameters {
	@jsonBigIntMember() powDepth: bigint;
	@jsonBigIntMember() epochDuration: bigint;
	@jsonBigIntMember() initBlock: bigint;
	@jsonMember(ledger.Address) tee: ledger.Address;
	@jsonMember(ledger.Address) contract: ledger.Address;

	@jsonMapMember(String, () => ledger.Address, { shape: MapShape.OBJECT })
	tokenHolders: Map<string, ledger.Address>;
	
	@jsonMember(String) network: string;

	constructor(
		powDepth: bigint,
		epochDuration: bigint,
		initBlock: bigint,
		tee: ledger.Address,
		contract: ledger.Address,
		tokenHolders: Map<string, ledger.Address>,
		network: string
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
export class AttestationReportData extends Parameters {
	@jsonBigIntMember() nonce: bigint;
	@jsonMember(String) trustedBlockHash: string;
	@jsonBigIntMember() trustedBlockNum: bigint;

	constructor(
		p: Parameters,
		nonce: bigint,
		trustedBlockHash: string,
		trustedBlockNum: bigint
	) {
		super(
			p?.powDepth,
			p?.epochDuration,
			p?.initBlock,
			p?.tee,
			p?.contract,
			p?.tokenHolders,
			p?.network);

		this.nonce = nonce;
		this.trustedBlockHash = trustedBlockHash;
		this.trustedBlockNum = trustedBlockNum;
	}
}

@jsonObject
export class AttestationResult {
	@jsonMember(AttestationReportData) data: AttestationReportData;
	@jsonMember(String) report: string;

	constructor(
		data: AttestationReportData,
		report: string
	) {
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
