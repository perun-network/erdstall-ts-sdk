// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonMember,
	jsonObject,
	Serializable,
} from "#erdstall/export/typedjson";
import { customJSON } from "#erdstall/api/util";
import { Transaction, registerTransactionType } from "./transaction";
import { Address, Crypto } from "#erdstall/crypto";
import { ErdstallObject, registerErdstallType } from "#erdstall/api";

const exitTypeName = "ExitRequest";

@jsonObject
export abstract class ExitMode extends ErdstallObject {
	@jsonMember(Boolean)
	immediate: boolean;

	constructor(immediate: boolean) {
		super();
		this.immediate = immediate;
	}
}

customJSON(ExitMode);

const fullExitTypeName = "full";

@jsonObject
export class FullExit extends ExitMode {
	// NOTE: Add "omitempty" in backend, to remove preserveNull here.
	@jsonMember(Number, { preserveNull: true })
	chain: number;

	constructor(chain: number, immediate: boolean) {
		super(immediate);
		this.chain = chain;
	}

	public objectType(): Serializable<ErdstallObject> {
		return FullExit;
	}
	protected objectTypeName(): string {
		return fullExitTypeName;
	}
}

const partialExitTypeName = "partial";

@jsonObject
export class PartialExit extends ExitMode {
	public objectType(): Serializable<ErdstallObject> {
		return PartialExit;
	}
	protected objectTypeName(): string {
		return partialExitTypeName;
	}
}

registerErdstallType(fullExitTypeName, FullExit);
registerErdstallType(partialExitTypeName, PartialExit);

@jsonObject
export class ExitRequest extends Transaction {
	@jsonMember(ExitMode)
	mode?: ExitMode;

	@jsonMember(Boolean)
	override: boolean;

	constructor(
		sender: Address<Crypto>,
		nonce: bigint,
		override: boolean,
		mode?: FullExit | PartialExit,
	) {
		super(sender, nonce);

		this.override = override;
		this.mode = mode;
	}

	public txType() {
		return ExitRequest;
	}

	protected txTypeName(): string {
		return exitTypeName;
	}
}

registerTransactionType(exitTypeName, ExitRequest);
