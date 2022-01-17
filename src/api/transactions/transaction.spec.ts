// SPDX-License-Identifier: Apache-2.0
"use strict";

import "reflect-metadata";
import { describe, it } from "mocha";
import { TypedJSON } from "#erdstall/export/typedjson";
import { Call, Result, ErdstallObject } from "#erdstall/api";
import { expect } from "chai";
import { Transaction } from "./transaction";
import { Trade } from "./trade";
import { Address } from "#erdstall/ledger";
import { utils } from "ethers";

describe("Wiremessages", () => {
	it("de-/encodes subscriptions", () => {
		genericJSONTest(testSubscribeTXs, Call);
		genericJSONTest(testSubscribeBalanceProofs, Call);
		genericJSONTest(testSubscribePhaseShifts, Call);
	});
	it("de-/encodes errors", () => {
		genericJSONTest(testError, Result);
	});
	it("de-/encodes exitrequests", () => {
		genericJSONTest(testExitRequest, Call);
	});
	it("de-/encodes transfers", () => {
		genericJSONTest(testTransfer, Call);
	});
	it("de-/encodes phaseshifts", () => {
		genericJSONTest(testPhaseShift, Call);
	});
	it("de-/encodes mints", () => {
		genericJSONTest(testMint, Call);
	});
	it("de-/encodes trades", () => {
		genericJSONTest(testTrade, Call);
	});
	it("trade ABI test (fees)", () => {
		// Generated randomly in go.
		const testCase: any = {
			contract: Address.fromString(
				"0x6e2FD8A6FB6caf3612967AadC749763e9657e9D1",
			),
			tradeTX: TypedJSON.parse(testTrade, Call)!
				.data as Transaction as Trade,
			tradeOfferABI:
				"0x00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000853e4adb7133a2428f9110d6fe90528f952c9b8a00000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000001d6b500e63ff2af00000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000062000000000000000000000000000000000000000000000000000000000000000124572647374616c6c54726164654f66666572000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000260000000000000000000000000864d521069db48e3ecc0fb37758fe390ffc52792000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000206c0586c8342049adb937086313fb85455a9c12dff262d0e450e148abac29d8cb0000000000000000000000008930626eb9d0021f4c55112252ba3d204ce042650000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004033f7ef5bcef66ea157f22ece0b7941897c67fa4bb2fd8d1af25224e9a2d24fcef2c182b9a127700c4025f9ec0c98cc35b94d51c88aa553cfd096b97f7586e2be00000000000000000000000090a178bdf2018e4cb104b28f6276cdfa0e32f1fd0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006038424b50e731a15664fc82bb4d7a9288a20effb7092a477a30f3eca90122c7dc5d4350a213f20b5c521a7877e09ff95d7eee15c975c8280b952a2fa57ad8bac584f9d82636fe8a455a57af682c1a88fedf173ae0c17af601496d643b09f590c9000000000000000000000000ab5e120e45085aaaaac8f81d21087c8c6cec81ce00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020617683715581a365caf4354ecb69b248fbde705ccdbd33b6ef3048344407ea920000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000ac15eca362aeae4876e76fbd5648130e8f123f290000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002066cccdc1cb7da5c70669401f4b617b26a69ae3df1598d4a781f9927b6b42a5ce000000000000000000000000d26267f82969fba5d6be0986f5a505f1604107b5000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000207932032e2e9e3ca0183fa006dcf696e2263b04ab84da3c907afb98c50b3ffa0d000000000000000000000000d740ae29e3d69e2f42899e413381e1553840f72a00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020133cfb4f6aafb36324186e6c6da8d56cf1812d048e5a39f3db714c2a195b042d000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000800000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d100000000000000000000000049ed509ee584a17987156e276f180b234e79292c00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000114572647374616c6c5472616465466565730000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000035b7ef7803eb1a954517ee58aa9ea5964afd44ce000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000203aeb4f544769e0a8dd5ab3d2a8569336cadeb54db0af60cf79c5c13f8b1c1b86000000000000000000000000ccf0fbe58471cb5e6e4bf25fddb8f8709b24f1fc00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020118d5931da69e0069fcb94ef71e248bb22379080bd8983dda622c7c9a59416df",
			tradeTXABI:
				"0x00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000cc7b33980df2ed446b3ece6598ddd4a0373ac86f0000000000000000000000000000000000000000000000008b7b899853b7799c00000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000000f4572647374616c6c54726164655458000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000410a608b36448f0ffb2ba265fc031cc7ec31ac44bd7185a72661afef805c8e06465fc4ccbcc4ed2790ec003dbb7584da98a264b47a553c1bbab087c882890813ce1c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000086000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000853e4adb7133a2428f9110d6fe90528f952c9b8a00000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000001d6b500e63ff2af00000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000062000000000000000000000000000000000000000000000000000000000000000124572647374616c6c54726164654f66666572000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000260000000000000000000000000864d521069db48e3ecc0fb37758fe390ffc52792000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000206c0586c8342049adb937086313fb85455a9c12dff262d0e450e148abac29d8cb0000000000000000000000008930626eb9d0021f4c55112252ba3d204ce042650000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004033f7ef5bcef66ea157f22ece0b7941897c67fa4bb2fd8d1af25224e9a2d24fcef2c182b9a127700c4025f9ec0c98cc35b94d51c88aa553cfd096b97f7586e2be00000000000000000000000090a178bdf2018e4cb104b28f6276cdfa0e32f1fd0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006038424b50e731a15664fc82bb4d7a9288a20effb7092a477a30f3eca90122c7dc5d4350a213f20b5c521a7877e09ff95d7eee15c975c8280b952a2fa57ad8bac584f9d82636fe8a455a57af682c1a88fedf173ae0c17af601496d643b09f590c9000000000000000000000000ab5e120e45085aaaaac8f81d21087c8c6cec81ce00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020617683715581a365caf4354ecb69b248fbde705ccdbd33b6ef3048344407ea920000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000ac15eca362aeae4876e76fbd5648130e8f123f290000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002066cccdc1cb7da5c70669401f4b617b26a69ae3df1598d4a781f9927b6b42a5ce000000000000000000000000d26267f82969fba5d6be0986f5a505f1604107b5000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000207932032e2e9e3ca0183fa006dcf696e2263b04ab84da3c907afb98c50b3ffa0d000000000000000000000000d740ae29e3d69e2f42899e413381e1553840f72a00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020133cfb4f6aafb36324186e6c6da8d56cf1812d048e5a39f3db714c2a195b042d000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000800000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d100000000000000000000000049ed509ee584a17987156e276f180b234e79292c00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000114572647374616c6c5472616465466565730000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000035b7ef7803eb1a954517ee58aa9ea5964afd44ce000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000203aeb4f544769e0a8dd5ab3d2a8569336cadeb54db0af60cf79c5c13f8b1c1b86000000000000000000000000ccf0fbe58471cb5e6e4bf25fddb8f8709b24f1fc00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020118d5931da69e0069fcb94ef71e248bb22379080bd8983dda622c7c9a59416df",
		};
		const offer = testCase.tradeTX.offer;
		expect(offer.fees).to.exist;
		expect(utils.hexlify(offer.packTagged(testCase.contract).bytes)).eql(
			testCase.tradeOfferABI,
		);
		expect(
			utils.hexlify(testCase.tradeTX.packTagged(testCase.contract).bytes),
		).eql(testCase.tradeTXABI);
	});

	it("trade ABI test (no fees)", () => {
		// Generated randomly in go.
		const testCase: any = {
			contract: Address.fromString(
				"0x6e2FD8A6FB6caf3612967AadC749763e9657e9D1",
			),
			tradeTX: TypedJSON.parse(
				'{"sig":"0x4fda8964bb4929ed959b8efc6246686c0c851dd1b2f5ff13e7822e6a120544b5547ed6585b25e56602b616b9ac1fc640c387b329178df9bb9f8f0839a6b7c5e11b","sender":"0xcc7b33980df2ed446b3ece6598ddd4a0373ac86f","nonce":"3154030767102693157","offer":{"sig":"0x1935fa389c56ae1deb654b443bd060aa7c58ce97c26ab2bf66f6e9fb85993c1479961b5d96d4c75d80766ae921fb2c81540a5a4686ac37a319e401d031f0a83b1b","owner":"0x853e4adb7133a2428f9110d6fe90528f952c9b8a","offer":{"0x074B0E4cEA85fe6CfEaa1FA5B78aAa137b6C25bA":{"uint":"0x6a2725d52f730ffad9aeaad635512ff952da8971fc39c459e4070a8247cafd86"},"0xBB4e8bD29bbC6c51F7C6204fA131bbF5dE8C7D44":{"uint":"0x9fd4c0687e0f8e85a150bf90b77cbca7f0fec4b9cc8cd97aca91f00e874854f0"},"0xB2F30aCb3D83Eb5310796e3374bE07FcBAeaF8cF":{"uint":"0x178b5ea097edc5fc1ce84a83cb70ada998175f31bb1a81ee1545ec1f27bb9f2f"},"0x0264c08e7381e5275Db666CE3963caD731b71082":{"uint":"0x2f377d8541c4f898abb0d46aad3bc32250270c3faed5a2fc9b66eb57a835d079"}},"expiry":"3510488203188983396","request":{"0x1B8C723CFc1085deBDC8149fea278ddA2CDB7861":{"idset":["0x5208cfd459064675857e2762b5d737508c6ef48c56368cd383a80d6cb5b8ee9c","0xa03135f543d627c14826ab8d9958fb034a332424dae01c6ac25fb18b55cc6c02","0xf93f1b36d53b9f1b53ef620758d817602d6ba4046d3090816af8dc45444645ae"]},"0x63A648217cA03A44A0168d6Ca8aaF633F7c17995":{"uint":"0xd7b959541314b6b5d927cd0fb7bb286594a7e24da98ca89973db17598f0d9e60"},"0xA4608979e027ac444Cc34E2D754EE99E7d2Be147":{"uint":"0x79ede6b960bd5b7b983b935df0cd75c67a4f6335d5da5c2622a77487074ea423"}}}}',
				Trade,
			)!,
			tradeOfferABI:
				"0x00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000853e4adb7133a2428f9110d6fe90528f952c9b8a000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000030b7c26be347566400000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000124572647374616c6c54726164654f666665720000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000264c08e7381e5275db666ce3963cad731b71082000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000202f377d8541c4f898abb0d46aad3bc32250270c3faed5a2fc9b66eb57a835d079000000000000000000000000074b0e4cea85fe6cfeaa1fa5b78aaa137b6c25ba000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000206a2725d52f730ffad9aeaad635512ff952da8971fc39c459e4070a8247cafd86000000000000000000000000b2f30acb3d83eb5310796e3374be07fcbaeaf8cf00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020178b5ea097edc5fc1ce84a83cb70ada998175f31bb1a81ee1545ec1f27bb9f2f000000000000000000000000bb4e8bd29bbc6c51f7c6204fa131bbf5de8c7d44000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000209fd4c0687e0f8e85a150bf90b77cbca7f0fec4b9cc8cd97aca91f00e874854f000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000001b8c723cfc1085debdc8149fea278dda2cdb7861000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000605208cfd459064675857e2762b5d737508c6ef48c56368cd383a80d6cb5b8ee9ca03135f543d627c14826ab8d9958fb034a332424dae01c6ac25fb18b55cc6c02f93f1b36d53b9f1b53ef620758d817602d6ba4046d3090816af8dc45444645ae00000000000000000000000063a648217ca03a44a0168d6ca8aaf633f7c1799500000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020d7b959541314b6b5d927cd0fb7bb286594a7e24da98ca89973db17598f0d9e60000000000000000000000000a4608979e027ac444cc34e2d754ee99e7d2be1470000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002079ede6b960bd5b7b983b935df0cd75c67a4f6335d5da5c2622a77487074ea4230000000000000000000000000000000000000000000000000000000000000000",
			tradeTXABI:
				"0x00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000cc7b33980df2ed446b3ece6598ddd4a0373ac86f0000000000000000000000000000000000000000000000002bc55e459bcf0f2500000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000000f4572647374616c6c54726164655458000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000411935fa389c56ae1deb654b443bd060aa7c58ce97c26ab2bf66f6e9fb85993c1479961b5d96d4c75d80766ae921fb2c81540a5a4686ac37a319e401d031f0a83b1b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000062000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000853e4adb7133a2428f9110d6fe90528f952c9b8a000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000030b7c26be347566400000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000124572647374616c6c54726164654f666665720000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000264c08e7381e5275db666ce3963cad731b71082000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000202f377d8541c4f898abb0d46aad3bc32250270c3faed5a2fc9b66eb57a835d079000000000000000000000000074b0e4cea85fe6cfeaa1fa5b78aaa137b6c25ba000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000206a2725d52f730ffad9aeaad635512ff952da8971fc39c459e4070a8247cafd86000000000000000000000000b2f30acb3d83eb5310796e3374be07fcbaeaf8cf00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020178b5ea097edc5fc1ce84a83cb70ada998175f31bb1a81ee1545ec1f27bb9f2f000000000000000000000000bb4e8bd29bbc6c51f7c6204fa131bbf5de8c7d44000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000209fd4c0687e0f8e85a150bf90b77cbca7f0fec4b9cc8cd97aca91f00e874854f000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000001b8c723cfc1085debdc8149fea278dda2cdb7861000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000605208cfd459064675857e2762b5d737508c6ef48c56368cd383a80d6cb5b8ee9ca03135f543d627c14826ab8d9958fb034a332424dae01c6ac25fb18b55cc6c02f93f1b36d53b9f1b53ef620758d817602d6ba4046d3090816af8dc45444645ae00000000000000000000000063a648217ca03a44a0168d6ca8aaf633f7c1799500000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020d7b959541314b6b5d927cd0fb7bb286594a7e24da98ca89973db17598f0d9e60000000000000000000000000a4608979e027ac444cc34e2d754ee99e7d2be1470000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002079ede6b960bd5b7b983b935df0cd75c67a4f6335d5da5c2622a77487074ea4230000000000000000000000000000000000000000000000000000000000000000",
		};
		const offer = testCase.tradeTX.offer;
		expect(offer.fees).to.be.undefined;
		expect(utils.hexlify(offer.packTagged(testCase.contract).bytes)).eql(
			testCase.tradeOfferABI,
		);
		expect(
			utils.hexlify(testCase.tradeTX.packTagged(testCase.contract).bytes),
		).eql(testCase.tradeTXABI);
	});
	it("de-/encodes receipts", () => {
		genericJSONTest(testTxReceipt, Result);
	});
	it("de-/encodes clientconfigs", () => {
		genericJSONTest(testClientConfig, Result);
	});
	it("de-/encodes balanceproofs", () => {
		genericJSONTest(testBalanceProofs, ErdstallObject);
	});
});

function genericJSONTest(data: string, type: any) {
	const res = TypedJSON.parse(data, type);
	expect(JSON.parse(TypedJSON.stringify(res, type))).eql(JSON.parse(data));
}

const testBalanceProofs =
	'{"type":"BalanceProofs","data":{"0x923439be515b6a928cb9650d70000a9044e49e85":{"balance":{"epoch":"53","account":"0x923439be515b6a928cb9650d70000a9044e49e85","values":{"0x079557d7549d7d44f4b00b51d2c532674129ed51":{"uint":"0x3cfc82e37e9a7400000"}},"exit":false},"sig":"0xc93a0443d473783cf927dc1ccc17026b613ef3ceda5625c77949a07f2aa3b39253f1cc02b838e74afca27ff77e67493d9e20e1b36faf41dec442169d0d8851be1c"},"0xb5d05705c467bfed944b6769a689c7766cc1f805":{"balance":{"epoch":"53","account":"0xb5d05705c467bfed944b6769a689c7766cc1f805","values":{"0x079557d7549d7d44f4b00b51d2c532674129ed51":{"uint":"0xcff253a09503f9c00000"}},"exit":false},"sig":"0xe2cda7c66ce85bbcc25bafee085421bb38ce496f2052a05d9a78ef1238df41696b37217c4cf6c4dc885b42a6c756cbf08af7334ec5a33615d1465b62973a40c71c"}}}';

const testClientConfig =
	'{"data":{"type":"ClientConfig","data":{"networkID":"1337","contract":"0x923439be515b6a928cb9650d70000a9044e49e85","powDepth":0}}}';

const testTxReceipt =
	'{"data":{"type":"TxReceipt","data":{"tx":{"type":"Transfer","data":{"sig":"0x7c8dd0125f6a66bf6499dc8b9ad6112c9e8386d302292f6edac40795717069023dd1c854c289c1041d63141fae32efff8bb164cdffffcdc61c386e2e328281d5c6","sender":"0x7945cce3e39817d2c90a01964326928e9c29bb9b","nonce":"10566160847212099840","recipient":"0x9f0b80b05076d7ecc179ff69f425c5fba4f4a745","values":{"0x5881a8f6ae574e6e1ad2dcbee153eb19f3ad202e":{"idset":["0x4f805080427a3be8fa5b4a9120b7e8561dfff0aa9363dc53f6cff605f8f1e501","0x6cae9cedec5ec19cbc32200e782b6f5f252d921daa660fdca3b4809cd70dd87c","0xe9ecb17355925cfa24514ecfab4a9c1ec9d4c57b94438d0963ea4a02c0c227de"]},"0xae5e37380766084528ef3b74c53d966f9f3ea0fa":{"uint":"0x2229985f3b41f9ea8b9556eef149a27a195f97d5ea84026be656b976ab725547"},"0x85306faded302ec825af9e70c630467abd2e2087":{"uint":"0x9ce101d80ae62d78b8990cd424c1e425372ad422017a771304bf6296087e5627"}}}},"delta":{"0x1bdf435244c1b0187ab0402b5d02d3320252f321":{"nonce":"9202321886040839616","values":{"0x8fb0ab6546ac10b8ded773dcf5cef39c9705a1f2":{"uint":"0xd681cf510d825d1b431c7ffa47255e63ff2a5dbe3152625b3ee341265250c12"},"0x266d23936dee62732334650f590c69aced1cea18":{"idset":["0x1ae71cdf998dc9fc85e4805b611c209c88909f72b76bde9e4468c661a52c2623"]},"0xb410a6519d7d40c656026a66aea0fc3f0607f432":{"idset":["0x3fa14f9cd274ba096cb7bd4dad32bc8c232248bad0bf7692201170e63bf90d62"]}},"locked":{"0x3b81fe88ad4006d80a45f58d3f827c11d287336a":{"idset":["0x3e14530ad38cf441de06b728c3ce482f7dbfade2c5b0b53818d8d9c494f0fd44","0xcea56e346f9813075a0150196144a203adc51b6e10bfd928674daae9f91e9064"]},"0x6fa7e434aec934065b15ef723d87212f4e9d0b72":{"idset":["0x6c4da97f85856dc84cbf21e68ad3f4e91fd1ae201bb70ac0f84b260dae2f187f","0x8b0538e8229627238c1233f36f5d1370d7f9ea05698504945faaca6f518023b4"]},"0xf0c60ff8ff5248b2efa5f6bd3ddf757279c5d6e1":{"idset":["0x36cabd37a0fd3f955f8f832ffacbc46133146d0e5ea0a38d0a006bbcf006bbad","0x5e79327a12c53fc1b85a013b38ee5a3f8ddea24bc6d590c0ccbe2c72ab97eec4","0xc6a2f895d09ee6c44e5e64765fcfa0d38d118e59d4ea2a6f3d7745abcfc55972"]}}},"0x2923503d31a6e50ed04e47d120e6b5ff992b6f61":{"nonce":"14769450456375658264","values":{"0x1939f048806b2b33ae5808e1e9acbb2cc4ab31cc":{"idset":["0x709428b0d03e9f6131b581bf9f3a8c16e30cb9b0690f52c46fc3255153137b45","0x8ff4e185c76bc7c15c1ff255d47423f7ff511e287e3699b529fbe0dfdc028a94"]},"0xfd7db6ab03e437d90100d7fb36fa86206d461107":{"idset":["0x681b48964f39f8b43fbd9550826e782a72ffc36abc4956300368f74e5acfe0a0"]},"0x3bdbc9385c24eb2eb5cc6543ba74cd56b1010771":{"uint":"0xaeb1c2b5129f75e4369f2de7dbbdf5c73c88ec936eb7dbff2e6c79a8c82996be"}},"locked":{"0xd5386484ef22f5cbe5e02a2c88be39c95082da5b":{"uint":"0x213e70b082557bb8d160018b83f8c134c6990071ac5f4b17ce8e9b94fd513466"},"0xc2e95a2d42930fff1e901c0d24bd10ca63f774c5":{"uint":"0x9109b77c8a7749053bcc0a2294c78534a6c348dbc49c6fa7b6992e88c25e5fc3"},"0xb737b23483d0a9872958c3ec63cac7e99b04907a":{"uint":"0x5ae6816ec486b1e07a307feb017b8365678d98c4c57e2b7ce3c84fcd61961d7e"}}},"0x30553673812240560c1e56c9a6bd3a355eb10fe3":{"nonce":"15797924407999902608","values":{"0x2adf1a04b1c0f01ee10f75664cff8060bb64fb53":{"uint":"0xffb45bd2adce4c9f9e1d4abe3e83b609a80e38b856c82a2205eb6d6bfed1c04"},"0xde9f193eb5e8e7a2f26f2f9704ed561c841b76be":{"idset":["0x836acb46aa5b14ff3365daf99f7577be85b63043d3e8016efacda3a0ec7f3148","0xc0d272d45597731c37364d47552e36f0855aed2ba4add70e61859b527fdbd320","0xd4a4a5a66b836fe671c5d5aec861035044931b46b2dd98a1ff57f190460edea3"]},"0xdd1bfd8a17b5345dc821d605832e9e53b0eceab1":{"idset":["0x4616ad2affe15187c59de907ed3a65cf2527d42f7bf0f132e6870c8f86ce567","0x1fcf8651b2199d1120422c02c9f0980119ce3c02492c93bcd28a70941579ab7b"]}},"locked":{"0x08c3e1a963fc681824c819c0460c07fc2f29c387":{"uint":"0x9c7a584958c15ff5e534822635024e137cf11a721708977f0e5209b14ddd14f2"},"0xf5d74f2efb394ed817aad1fd355e694446abd068":{"idset":["0x1705d9e3741c5c602c5274f577555667e585a992223488688c2be27edbb6be01","0x297f8f451198994e1f39f9b9c11ada9159996a8bf089552191041d345caf1608","0x793165895c3cbd76fbd3ac6f06506c1b8df1a203a8e4de580ad92aa2022b7061"]},"0x2da6962b86efed5ffbc0e1555818c72b64f9edb2":{"idset":["0x45ff1727d48f3d4bce921ad2a0828e35eda3ed1c0f5ff88a3f1e7116215a22c4","0xaad2354c1ed51fa04b01dfce7082098fd1254e040937c1af491f358be216383a","0xedbf858d039ed1408373183446ab224fb4ab3da2acac216ebaff4c545b0eef3e"]}}}}}}}';

const testTransfer =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Transfer","data":{"sig":"0x4702a782ed2cec2d0f6a3033b0b5cc4628da33cabf84c4c61d50ed2676eb00dd5f8738c56c1c4bb9b0372b0ac934ceff9963afc509534bef5410c67e04d946e5f6","nonce":"216021471606088551","sender":"0xaac91eb099bfedca2bb0c7c0242dd1a6533a8bad","recipient":"0x8121a1e0f4eec3ae4006699df217695e94a9bc50","values":{"0xbca5e7a4bcd379ed0a508658185804607d3e660c":{"uint":"0x1de2b278042605c0af89c122064c942730ff97a82d2a0c1bd5506818d2341241"},"0x668916e2947cb3430f586bd2c560a47cf8235c92":{"uint":"0xdb0e3b634d3c871dc7158488d50e25e860fc6daba25f39c917ed5993b32e3469"},"0x37c5dfc28c5a448ddc2868a64aad17362a6d0088":{"uint":"0x81987ded1cd1e4e1f6de6bdfa410c9815115d8cf3e131e3b010978c400a2edd5"}}}}}}';

const testExitRequest =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"ExitRequest","data":{"sig":"0x525612193533644d30fe57e6e8e1979319b3e6eae975ed2df3252c43c3ae721476cbf9d74aef61c1294704cc00a7ec36aa6e2181127831f57d6f0518e0c459b7c0","nonce":"1863693455832366668","sender":"0x972cb3cc31ba2b845a52c6abaefcd5f09f7ba678"}}}}';

const testMint =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Mint","data":{"sig":"0x567f6956646dbc537ac6239f87e78416149ad102abf78f093a373ff6a283284f93853af25d07327b9135c6499c1c28fd6082be0563ddd559ac554d4a78eff61bad","nonce":"3424314417749617446","sender":"0x1be64a84d68c5cb92640eb7f64336fe5e180b676","token":"0x3c85ef52db875ca7a3ccaaedcc6fc86a25621b90","id":"123485"}}}}';

// Generated in go; do not change, because it is part of a set.
const testTrade =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Trade","data":{"sig":"0x91f37b5382eaa82851faf5066aac2e72a9253890c6601f3c5b33d2cce20388790e366482256e22a9e8c876d5119d1b99ac313ae53ce460fdaad74e067c9f9deb1c","sender":"0xcc7b33980df2ed446b3ece6598ddd4a0373ac86f","nonce":"10050778280739961244","offer":{"sig":"0x0a608b36448f0ffb2ba265fc031cc7ec31ac44bd7185a72661afef805c8e06465fc4ccbcc4ed2790ec003dbb7584da98a264b47a553c1bbab087c882890813ce1c","owner":"0x853e4adb7133a2428f9110d6fe90528f952c9b8a","offer":{"0x8930626eb9d0021f4c55112252ba3d204ce04265":{"idset":["0x33f7ef5bcef66ea157f22ece0b7941897c67fa4bb2fd8d1af25224e9a2d24fce","0xf2c182b9a127700c4025f9ec0c98cc35b94d51c88aa553cfd096b97f7586e2be"]},"0x90a178bdf2018e4cb104b28f6276cdfa0e32f1fd":{"idset":["0x38424b50e731a15664fc82bb4d7a9288a20effb7092a477a30f3eca90122c7dc","0x5d4350a213f20b5c521a7877e09ff95d7eee15c975c8280b952a2fa57ad8bac5","0x84f9d82636fe8a455a57af682c1a88fedf173ae0c17af601496d643b09f590c9"]},"0x864d521069db48e3ecc0fb37758fe390ffc52792":{"uint":"0x6c0586c8342049adb937086313fb85455a9c12dff262d0e450e148abac29d8cb"},"0xab5e120e45085aaaaac8f81d21087c8c6cec81ce":{"uint":"0x617683715581a365caf4354ecb69b248fbde705ccdbd33b6ef3048344407ea92"}},"expiry":"2119876072345381616","request":{"0xd26267f82969fba5d6be0986f5a505f1604107b5":{"uint":"0x7932032e2e9e3ca0183fa006dcf696e2263b04ab84da3c907afb98c50b3ffa0d"},"0xd740ae29e3d69e2f42899e413381e1553840f72a":{"uint":"0x133cfb4f6aafb36324186e6c6da8d56cf1812d048e5a39f3db714c2a195b042d"},"0xac15eca362aeae4876e76fbd5648130e8f123f29":{"uint":"0x66cccdc1cb7da5c70669401f4b617b26a69ae3df1598d4a781f9927b6b42a5ce"}},"fees":{"market":"0x49ed509ee584a17987156e276f180b234e79292c","fee":{"0x35b7ef7803eb1a954517ee58aa9ea5964afd44ce":{"idset":["0x3aeb4f544769e0a8dd5ab3d2a8569336cadeb54db0af60cf79c5c13f8b1c1b86"]},"0xccf0fbe58471cb5e6e4bf25fddb8f8709b24f1fc":{"idset":["0x118d5931da69e0069fcb94ef71e248bb22379080bd8983dda622c7c9a59416df"]}}}}}}}}';

const testPhaseShift =
	'{"id":"an-id","data":{"type":"PhaseShift","data":{"currentEpoch": "53"}}}';

const testError = '{"id":"an-id","error":"could not get proof"}';

const testSubscribeTXs =
	'{"id":"an-id","data":{"type":"SubscribeTXs","data":{"who":"0x92aaff3bba15f99960d54074ed2464c337fee0ab", "cancel": false}}}';
const testSubscribeBalanceProofs =
	'{"id":"an-id","data":{"type":"SubscribeBalanceProofs","data":{"who":"0x92aaff3bba15f99960d54074ed2464c337fee0ab", "cancel": false}}}';
const testSubscribePhaseShifts =
	'{"id":"an-id","data":{"type":"SubscribePhaseShifts","data":{"cancel": false}}}';
