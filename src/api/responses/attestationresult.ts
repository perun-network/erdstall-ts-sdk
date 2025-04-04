// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonU64Member,
	jsonObject,
	jsonMapMember,
	jsonMember,
	MapShape,
} from "#erdstall/export/typedjson";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import * as ledger from "#erdstall/ledger";
import { Chain } from "#erdstall/ledger";
import { Address } from "#erdstall/crypto";

const typeName = "AttestResponse";

type ProcessorInitReportData = Uint8Array;

@jsonObject
export class Parameters {
	@jsonU64Member() powDepth: bigint;
	@jsonU64Member() epochDuration: bigint;
	@jsonU64Member() initBlock: bigint;
	@jsonMember(() => Address) tee: Address;
	@jsonMember(() => Address) contract: Address;

	@jsonMapMember(String, () => Address, { shape: MapShape.OBJECT })
	tokenHolders: Map<string, Address>;

	@jsonMember(String) network: string;

	constructor(
		powDepth: bigint,
		epochDuration: bigint,
		initBlock: bigint,
		tee: Address,
		contract: Address,
		tokenHolders: Map<string, Address>,
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
export class AttestationReportChainData {
	@jsonMember(() => Address)
	address: Address;
	//@jsonMember(() => ProcessorInitReportData)
	processorData: ProcessorInitReportData;
	constructor(
		address: Address,
		processorData: ProcessorInitReportData,
	) {
		this.address = address;
		this.processorData = processorData;
	}
}

@jsonObject
export class AttestationReportData {
	@jsonMember(() => Parameters) params: Parameters;
	@jsonMapMember(Number, () => AttestationReportChainData) chains: Map<
		Chain,
		AttestationReportChainData
	>;
	@jsonU64Member() nonce: bigint;

	constructor(
		p: Parameters,
		chains: Map<Chain, AttestationReportChainData>,
		nonce: bigint,
	) {
		this.params = p;
		this.chains = chains;
		this.nonce = nonce;
	}
}

@jsonObject
export class AttestationResult {
	@jsonMember(() => AttestationReportData) data: AttestationReportData;
	@jsonMember(String) report: string;

	constructor(data: AttestationReportData, report: string) {
		this.data = data;
		this.report = report;
	}
}

@jsonObject
export class AttestResponse extends ErdstallObject {
	@jsonMember(() => AttestationResult) attestation: AttestationResult;

	constructor(attestation: AttestationResult) {
		super();
		this.attestation = attestation;
	}

	public objectType(): any {
		return AttestResponse;
	}
	override objectTypeName(): string {
		return typeName;
	}
}

registerErdstallType(typeName, AttestResponse);
