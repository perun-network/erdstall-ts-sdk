// SPDX-License-Identifier: Apache-2.0
"use strict";

import { ErdstallObject } from "./object";
import { jsonObject, jsonMember } from "#erdstall/export/typedjson";

/** All incoming messages. */
@jsonObject
export class Result {
	@jsonMember(Number) id?: number;
	@jsonMember(() => ErdstallObject) data?: ErdstallObject;
	@jsonMember(Boolean) pending?: true;
	@jsonMember(String) error?: string;

	constructor(
		id?: number,
		data?: ErdstallObject,
		pending?: boolean,
		error?: string,
	) {
		this.id = id;
		this.data = data;
		this.pending = pending || undefined;
		this.error = error;
	}

	// Messages marked as pending mean that there is still a pending reply with the same id to be waited for.
	isPending(): boolean {
		return this.pending ?? false;
	}

	isResponse(): boolean {
		return this.id !== undefined;
	}
	payload(): ErdstallObject {
		if (this.error) throw new Error(this.error!);
		return this.data!;
	}
}
