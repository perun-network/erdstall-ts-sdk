import { expect } from "chai";
import { mkBigInt } from "./bigint";
import * as test from "#erdstall/test";

describe("bigints", function () {
	const rng = test.newPrng();
	describe("creates bigints of proper size", function () {
		const mkEdgecasesEntries = (
			intSize: 8 | 16 | 32,
		): [number, bigint, string][] => {
			return [
				[
					intSize - 1,
					(1n << BigInt(intSize - 1)) - 1n,
					`one below intSize: ${intSize}`,
				],
				[
					intSize,
					(1n << BigInt(intSize)) - 1n,
					`exactly intSize: ${intSize}`,
				],
				[
					intSize + 1,
					// Last bigint never has the last bit set because we use
					// (2**intSize - 1) as a value to fill.
					(1n << BigInt(intSize + 1)) - 2n,
					`one above intSize: ${intSize}`,
				],
			];
		};

		const intSizes: [8 | 16 | 32, number][] = [
			[8, 0xff],
			[16, 0xffff],
			[32, 0xffffffff],
		];
		for (const [intSize, maxValOfIntSize] of intSizes) {
			it(`does so for intSize ${intSize}`, function () {
				const arr = [maxValOfIntSize];
				const testcases: [number, bigint, string][] = [
					[0, 0n, "zero bitdwith"],
					[1, 1n, "one bitwidth"],
					[2, 3n, "two bitwidth"],
					...mkEdgecasesEntries(intSize),
				];
				for (const [bitsize, expectedVal, msg] of testcases) {
					expect(
						mkBigInt(arr.values(), bitsize, intSize),
						msg,
					).to.equal(expectedVal);
				}
			});
		}
	});

	it("creates bigints from Uint8Array input matching bitWidth", function () {
		const MAX_INPUT_LEN = 64 * 8; // has to be divisble by 8.
		const maxInput = test.newRandomUint8Array(rng, MAX_INPUT_LEN);

		for (let i = 1; i <= MAX_INPUT_LEN / 8; ++i) {
			const arr = maxInput.slice(0, i);
			expect(
				mkBigInt(arr.values(), i * 8, 8),
				`bigint with bitWidth of ${MAX_INPUT_LEN}`,
			).to.equal(
				BigInt(
					`0x${[...arr]
						.map((v) => v.toString(16).padStart(2, "0"))
						.join("")}`,
				),
			);
		}
	});

	it("uses MSB of input value to fill remaining bits", function () {
		const NUM_TESTCASES = 64;
		const intSizes = [8, 16, 32] as const;
		for (let i = 0; i < NUM_TESTCASES; ++i) {
			const intSize = intSizes[rng.uInt32() % 3];
			const bitWidth = rng.uInt32() % intSize;
			const expBitMask = Number(
				`0b${"1".repeat(bitWidth)}${"0".repeat(intSize - bitWidth)}`,
			);
			const arr = [rng.uInt32()];
			const expRes =
				(BigInt(arr[0]) & BigInt(expBitMask)) >>
				(BigInt(intSize) - BigInt(bitWidth));
			expect(
				mkBigInt(arr.values(), bitWidth, intSize),
				`bitWidth: ${bitWidth} intSize: ${intSize} value: ${arr[0].toString(
					2,
				)}`,
			).to.equal(expRes);
		}
	});
});
