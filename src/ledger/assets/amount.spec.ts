// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";
import { Amount, encodePackedAmount, decodePackedAmount } from "./amount";
import { Tokens } from "./tokens";
import * as test from "#erdstall/test";
import { logSeedOnFailure } from "#erdstall/test";

describe("Amount", () => {
	it("can add amounts", () => {
		let t1 = new Amount(123n);
		let t2 = new Amount(321n);
		t1.add(t2);
		expect(t1.value, "adding compatible tokens should work").to.eql(
			123n + 321n,
		);

		expect(() => {
			t1.add(new Tokens([123n]));
		}, "adding incompatible tokens should error").throws;
	});

	it("can sub amounts", () => {
		let t1 = new Amount(124n);
		let t2 = new Amount(123n);
		t1.sub(t2);
		expect(t1.value, "subtracting compatible tokens should work").to.eql(
			1n,
		);

		expect(() => {
			t1.sub(t2);
		}, "subtracting compatible tokens which lead to out of bounds values should throw")
			.throws;
	});
});

describe("Amount:Decoding", function () {
	const rng = test.newPrng();
	it("allows to properly decode packed amounts", function () {
		const v = test.newRandomAmount(rng);
		const packedV = encodePackedAmount(v.value);
		expect(decodePackedAmount(packedV).value).to.deep.equal(v.value);
	});

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});
