// SPDX-License-Identifier: Apache-2.0
"use strict";

import { expect } from "chai";
import { Tokens, decodePackedIds } from "./tokens";
import * as test from "#erdstall/test";
import { logSeedOnFailure } from "#erdstall/test";

describe("Tokens", () => {
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
		expect(t1.value, "subbing compatible tokens should work").to.eql([
			123n,
		]);
		expect(() => {
			t1.sub(t2);
		}, "subbing incompatible tokens should throw").throws;
	});

	it("compares tokens", () => {
		expect(new Tokens([124n]).cmp(new Tokens([]))).to.eql("gt");
		expect(new Tokens([124n]).cmp(new Tokens([124n]))).to.eql("eq");
		expect(new Tokens([125n]).cmp(new Tokens([124n]))).to.eql(
			"uncomparable",
		);
		expect(new Tokens([125n]).cmp(new Tokens([124n, 125n]))).to.eql("lt");
		expect(new Tokens([126n]).cmp(new Tokens([124n, 125n]))).to.eql(
			"uncomparable",
		);
		expect(new Tokens([126n]).cmp(new Tokens([124n, 125n]))).to.eql(
			"uncomparable",
		);
		expect(
			new Tokens([123n, 125n]).cmp(new Tokens([123n, 124n, 125n, 126n])),
		).to.eql("lt");
		expect(
			new Tokens([123n, 124n]).cmp(new Tokens([122n, 123n, 124n, 125n])),
		).to.eql("lt");
		expect(
			new Tokens([123n, 124n, 125n]).cmp(new Tokens([123n, 124n])),
		).to.eql("gt");
		expect(
			new Tokens([122n, 123n, 124n, 125n]).cmp(new Tokens([123n, 124n])),
		).to.eql("gt");
	});

	it("sorts tokens", () => {
		expect(() => new Tokens([123n, 124n, 125n, 124n])).throws;
		expect(() => new Tokens([1n, 2n, -3n])).throws;
		expect(new Tokens([1234n, 123n, 234n]).value).to.eql([
			123n,
			234n,
			1234n,
		]);
		expect(new Tokens([1n, 10n, 2n]).value).to.eql([1n, 2n, 10n]);
	});
});

describe("Tokens:Decoding", function () {
	const rng = test.newPrng();
	it("allows to properly decode packed IDs", function () {
		const ids = test.newRandomTokens(rng, 101);
		const idsPacked = utils.hexlify(utils.concat(ids.value.map(
			id => utils.defaultAbiCoder.encode(["uint256"], [value]))));
		expect(decodePackedIds(idsPacked)).to.deep.equal(ids.value);
		expect(decodePackedIds("")).to.deep.equal([]);
		expect(decodePackedIds("0x")).to.deep.equal([]);
		expect(() => decodePackedIds("0x01")).to.throw;
	});

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});
