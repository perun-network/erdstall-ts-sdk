// SPDX-License-Identifier: Apache-2.0
"use strict";

import { Backend } from "./backends";
import { Serializable, TypedJSON } from "#erdstall/export/typedjson";

const processorImpls = new Map<
	string,
	Serializable<ProcessorInitReportData<Backend>>
>();

export function registerProcessoInitReportDataType(
	typeName: string,
	typeClass: Serializable<ProcessorInitReportData<Backend>>,
) {
	processorImpls.set(typeName, typeClass);
}

// NOTE: Everything except Ethereum uses AuxData from core.
export abstract class ProcessorInitReportData<_B extends Backend> {
	static fromJSON(js: any): ProcessorInitReportData<Backend> {
		if (!processorImpls.has(js.type)) {
			throw new Error(`unknown processor type ${js.type}`);
		}
		return TypedJSON.parse(
			JSON.stringify(js.data),
			processorImpls.get(js.type)!,
		)!;
	}
}
