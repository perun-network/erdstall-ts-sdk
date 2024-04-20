import { expect } from "chai";
import { OneShotEventCache, EventCache } from "./event_cache";
import { ErdstallEvent, ErdstallEventHandler } from "#erdstall";
import * as test from "#erdstall/test";
import { logSeedOnFailure } from "#erdstall/test";

describe("OneShotEventCache", function () {
	const rng = test.newPrng();
	const cbs = [() => 42, () => 69, () => 420];
	const key = "proof";
	it("allows setting and removing multiple handlers", function () {
		const cache = new OneShotEventCache<ErdstallEvent, "ethereum">();
		cbs.forEach((cb) => cache.set(key, cb));
		expect(cache.has(key)).to.be.true;
		expectAllToBe(true, key, cbs, cache);
		expect(cache.has(key, () => {})).to.be.false;

		expect(cache.delete(key)).to.be.true;

		expectAllToBe(false, key, cbs, cache);
		expect(cache.has(key)).to.be.false;
	});

	it("allows deleting specific handlers", function () {
		const cache = new OneShotEventCache<ErdstallEvent, "ethereum">();
		cbs.forEach((cb) => cache.set(key, cb));
		expectAllToBe(true, key, cbs, cache);

		const idx = rng.uInt32() % cbs.length;
		expect(
			cache.delete(key, cbs[idx]),
			`deleting a specific handler should work: ${idx}`,
		).to.be.true;
		cbs.forEach((cb, i) => {
			if (i === idx)
				expect(
					cache.has(key, cb),
					`looking up deleted handler ${idx} should fail`,
				).to.be.false;
			else
				expect(
					cache.has(key, cb),
					`not deleted handler ${i} should still exist`,
				).to.be.true;
		});

		cache.delete(key);
		expectAllToBe(false, key, cbs, cache);
	});

	it("removes all entries for a key when getting", function () {
		const cache = new OneShotEventCache<ErdstallEvent, "ethereum">();
		expect(cache.get(key)).to.be.undefined;

		cbs.forEach((cb) => cache.set(key, cb));
		expectAllToBe(true, key, cbs, cache);
		expect(cache.get(key)).to.deep.equal(cbs);
		expectAllToBe(false, key, cbs, cache);
		expect(cache.has(key)).to.be.false;
	});

	afterEach(function () {
		logSeedOnFailure(rng, this.currentTest);
	});
});

describe("EventCache", function () {
	const cbs = [() => 42, () => 69, () => 420];
	const key = "proof";
	it("does not remove entries when getting", function () {
		const cache = new EventCache<ErdstallEvent, "ethereum">();
		expect(cache.get(key)).to.be.undefined;

		cbs.forEach((cb) => cache.set(key, cb));
		expectAllToBe(true, key, cbs, cache);
		expect(cache.get(key)).to.deep.equal(cbs);
		expectAllToBe(true, key, cbs, cache);
	});
});

function expectAllToBe(
	trueOrFalse: boolean,
	key: ErdstallEvent,
	collection: ErdstallEventHandler<typeof key, "ethereum">[],
	cache: OneShotEventCache<typeof key, "ethereum">,
) {
	expect(collection.every((cb) => cache.has(key, cb))).to.equal(trueOrFalse);
}
