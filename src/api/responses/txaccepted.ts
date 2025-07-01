// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject, registerErdstallType } from "#erdstall/api";
import { CodecReader, CodecWriter } from "#erdstall/utils";

const txAcceptedTypeName = "TxAccepted";

export class TxAccepted extends ErdstallObject {
		constructor(
	public call: bigint
		) { super(); }

	override objectType(): any { return TxAccepted; }
	override objectTypeName(): string { return txAcceptedTypeName; }

	override encode(w: CodecWriter): void { w.u64(this.call); }
	static decode(r: CodecReader): TxAccepted
		{ return new TxAccepted(r.u64()); }
}

registerErdstallType(txAcceptedTypeName, TxAccepted);
