// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";
import { Tokens } from "./tokens";

describe("tokens", () => {
	it("can add tokens", () => {
		let t1 = new Tokens([123n, 420n]);
		let t2 = new Tokens([321n]);
		t1.add(t2);
		expect(t1.value, "adding compatible tokens should work").to.eql([
			123n,
			321n,
			420n,
		]);

		expect(() => {
			t1.add(t2);
		}, "adding incompatible tokens should error").throws;
	});

	it("can sub tokens", () => {
		let t1 = new Tokens([123n, 321n]);
		let t2 = new Tokens([321n]);
		t1.sub(t2);
		console.log(t1);
		console.log(t2);
		expect(t1.value, "subbing compatible tokens should work").to.eql([
			123n,
		]);
		expect(() => {
			t1.sub(t2);
		}, "subbing incompatible tokens should throw").throws;
	});
});
