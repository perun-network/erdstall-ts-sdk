// SPDX-License-Identifier: Apache-2.0
"use strict";

import {
	jsonMember,
	jsonObject,
	Serializable,
} from "#erdstall/export/typedjson";
import { ABIEncoder, customJSON } from "#erdstall/api/util";
import { Transaction, registerTransactionType } from "./transaction";
import { Address } from "#erdstall/ledger";
import { Backend } from "#erdstall/ledger/backend";
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
	// TODO: Do we really need to preserve null here?
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
		sender: Address<Backend>,
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

	protected encodeABI(_e: ABIEncoder): string {
		return "ErdstallExitRequest";
	}
}

registerTransactionType(exitTypeName, ExitRequest);
