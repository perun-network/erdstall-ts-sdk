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
import { Transfer } from "./transfer";
import { TxReceipt, AttestationResult } from "../responses";

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
	it("validates signatures correctly", () => {
		const tx = TypedJSON.parse(testSignedOutput, TxReceipt);
		expect(tx!.verify(Address.fromString(signedOutputContract))).to.be.true;
	});
	it("de-/encodes clientconfigs", () => {
		genericJSONTest(testClientConfig, Result);
	});
	it("de-/encodes balanceproofs", () => {
		genericJSONTest(testBalanceProofs, ErdstallObject);
	});
	it("calculates the correct hash", () => {
		const tx = TypedJSON.parse(testHashing, Transfer);
		expect(tx!.hash()).to.equal(
			"0x4cc6db6207731e54b26e2b2bc3d55b916a37a70cbe19b2924a0b8e1c01b9a8f0",
		);
	});

	it("de-/encodes attestation reports", () => {
		genericJSONTest(testAttestResponse, ErdstallObject);
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
	'{"data":{"type":"TxReceipt","data":{"sig":"0xb248624409d4c8c03565ba537dfc2d95186b515189afd3817b9017ccd431f5b875802d7ef6b6eabff49f5b92297947881b4769693d89ff01d0d9020f8010fcebe0","delta":{"0x1c3cd10bbcc383f6ecad32d9914cf28534fa385d":{"nonce":"11304358851078477890","values":{"0x7763f26240f5834bd5b0388aa881c3790fefe221":{"idset":["0x7357290e321c4d90bfdf9789d73ce6c13e0183d6da16ef5766816a1d00deca1b"]},"0x777832113272674d9180f6021a9d2e3e66f14ee3":{"idset":["0x6b4a562d0a012a120e86bf11dc93206be3936d122895ffdd59e91bdb4c7e6cf5","0xb4b0559b42e25af09b4e81250ce5ae8d47397a6a0b31ee6a6cf9602b71db00bd"]},"0xad0c6e31022664a4da21a1fc8b9b0ac69478e71f":{"idset":["0x1229e8a0ba0eb9064a30747a2a754fcb5bb476952e074f5f6d1ab9e00adbd838","0x859a342781df531bfe76cdc93cb6e71011ea14dc32583a032195e74d0636cdb9","0xc5c966fef2b615b0fdacaa40911d196069f7ccd7c1794dfe1b3b5395178019a0"]}},"locked":{"0x313f462497573e43f5850210e3524332346c0d60":{"uint":"0x44e9e46ec202895162b3adea9422202a37e88a5222234a0c8fe96c0ac2cf0ad5"},"0xe5dfd1b783b1e14099c45dd6e3068617ab5bd758":{"idset":["0xa61e4d69bedd5054918be308c73b7fb3c686171c7ef412bb992a226aea2438d","0x59ba2f7816fbb9052e3ca18827d8b46a790915d7ce156991896f02591438a6a4"]},"0xc799e0b1c90eb2a9fa252f1481fa272ab72f9111":{"uint":"0x9690d3b9f1e5e7d79388f7650fd9f2488a4283069e711b351c8afdea930a5807"}}},"0xcdce776e5eb843bd4abfadf0ca0c60d98d88648d":{"nonce":"16771711264726685158","values":{"0xfb12ac3f2f6dd9e4e85f2fb1ac6bd25c01e5e9ca":{"uint":"0x26f36760dc8baed15dce9bf95238d2687db8d8a293c08fa92f5b857a579efbd9"},"0xe14849a3220701d40c6c07e88942f83d0f15bf6b":{"idset":["0x72ccd1bcc4b80855779ac83f13cd3d9486db85d2554408d9ec1e45a88796a5a1","0x8cc2bd5568c4513afdad9c067626d3787d4c30b245fa3c9b24ed72073628ec3b"]},"0x42f6468bebd133bef890fb372cb3dd92cf838905":{"idset":["0xf32c858e1b4d3d8dc52dd01b2e5472e88ba3794861481751ffde381a185966e","0x38dc97da20b5317dc5099baa9a3a77a0f9aa2023bb50746712ba32531db0b30b","0xc4edecd96cc9a7125d8538941d66d117a172396432d4a4a2aee26a11d6f733fd"]}},"locked":{"0xfed6ab837bc522ac7a14ce577020a1cb9304b7d0":{"uint":"0x3ef6873cbd4f0714688e3214a10a90a3ffd1929969afb9eafa3c44ef5046b66b"},"0xd3ea3b741fb632c906dd5d3541bc253de7e86ffe":{"uint":"0xd64497e02a11e1d66c1827ca3fe89b1cd3b45419e0f85c55cdf1034ac80a29fa"},"0x2e8c0db3132201acc0368c5fb1e73a584f2a3bfc":{"idset":["0xa0d8d6a4625d2a38343f495d272a9c61d31a3065e1d2f184602d70b65c238d30"]}}},"0xdbbc2576ab04a17101dc560fbe36b7956a6dd44c":{"nonce":"8125380604302822296","values":{"0x4cbbbf0163e9b5c967625037c9d1f5302b869fb9":{"idset":["0x29af4363b6e864d94cca8d93307c310fee3c7bad0836e6bb6ffc74dab33c5c8","0xbe785a21c6890d964f18182d45ba48cbbe5d3b9ac89ad5d8d6428999333b047","0xc50a73a33a6df2c016e964289aa3d012c4d51c991a83fd32eb3880f78bd2b327"]},"0xb8865dde41706c81aa137f974f47e4e7974644a4":{"uint":"0x815e946756e1ba7b421b73fbde786e5ca9dcb68b01efd9025259be5851521ccf"},"0xc73b8a6302597bd7cc4e535daf7d35d72d9aa92e":{"uint":"0x57f8dbf3d21c379fd35faf201d308dc114d4fa42a9911d8169906616998136f8"}},"locked":{"0xb8574513c6c1b2b61380c5137a671b67880a8835":{"uint":"0xfd4f03252808ae6b4aa2ad211476967bdd493019861b5af0eb2e121b4c3d7088"},"0x9e97a9add3a3775f37145556c39089699cba3982":{"idset":["0x27b30845d92ec05123b73ad9612316ef235ef0952a247d7c6853bce632aac8fd","0xcaf40be5ac8285db5ff3598e8d00068da7fa27812031899ab0b8a37ae1383364"]},"0x2258be0d9489a0b783beea19e8252039844e67ef":{"idset":["0xcd1b8e12143df6b9437588a0da78a28792db8a900bd6bd3c7830e5cfe23c5d5","0x8fdd9215e542781b5ad685a6690402818b31de7cc73bbdfe3a2d6912f3fa97e4","0xede366f9f9b08aa995afa220770bbe3dcbcb5e66834c3e602cb3aa007fbe4345"]}}}},"output":{"payload":"0x"},"hash":"0x0000000000000000000000000000000000000000000000000000000000000000","tx":{"type":"Transfer","data":{"sig":"0xc5bf9c583c77cb962281471c831b702fc190ee619706e544e09a5ba988fd62ed1f563e1d1ef27bd845da75dc1a61aa855bc8a793af5e46d8c41c72d240bfea3bf3","sender":"0xd66b1d27f9ef7bff1e5c5ded008e95ac9fb2b3fd","nonce":"1842239834448897509","recipient":"0x292d3568d14ca7d561760e6dec301ca87de57a91","values":{"0xcd4bc7926a1f1d90be83158469b2a8d06a9cfc43":{"uint":"0xa0c9843c095b20db78a476eda69d7a8c34cde04fb816190e0af03c02fe5431ed"},"0x9f6d65626d3b8fde581fa439d843c5a9c3e9ef9a":{"idset":["0x1d4ccb8457a1105bb765155ce61551156203866f22e4f0b53d66bbff3de1f79a","0x760ac2b8f6f5b3d91940c832ea118fb6c1cc10a13c00f8ca31cf622ad299dfe4"]},"0xb7d9faaf5c880424c12586589dd77a531030f469":{"idset":["0x6ccb6b91af6f9690b4760464515b62ced4e4125fda6c69ba08e44edc19f81176","0x810e62b97c4a0efe0b4f3929b9f8bab4f384101d4bba8e53bb5c939b84ed2e00","0xa03c19c4c26b7220fee3293c57efe4db4ddf77fce0bae28059eb79df4e0f6fce"]}}}},"status":0,"error":"HbBOmh7m4md9lFGaMnhEbnJkLJBnKo5E4lg"}}}';

const testSignedOutput =
	'{"sig":"0xf4b54e5f262589566ab639858b79fe4007d177ba17dceefc3377cecdbcb4b7046bb57bda4660b52a46124a3e34f35b3d9549bcf22b6b66c04eb545512ffdb98f1c","delta":null,"output":{"payload":"0xcd9f6db0c506d4bee96107a31f50f9f58c879af8b110c17a5490734759c8c836"},"hash":"0x0f67225d8abbfa2588351dd5b394bd0fd9472dda759ebe4d5cc58386a3192326","tx":{"type":"Transfer","data":{"sig":"0x3b44e0643f43e86e7d9cda9038f9b4cf7f4656abca8000df122112199eabd985b8041030f8997a671f949d7a2f3414824aad9ec49300417bd296aaae8eabfe185c","sender":"0x147eda1cc4d6f1377fa784ba1a1802caeae21074","nonce":"8822221320351597216","recipient":"0x0d09b1f87c3b2e9c2dfadd2da2b6249281128a80","values":{"0xb7595dbdbf76cb5ba39f532ff27cde291003153d":{"idset":["0xa761cec673a652a4ec4577a30aad2af98f36ab43fd23822afed7539c264fd356","0xf8872d7d2941e71861068a029b2a27a1ee071453556360ce909f799d6bf8097a"]},"0x6c6d4a7a45cf7598c89a9136257de0e6a1696f6b":{"uint":"0x7fedc4001e58450c2ab266388c6ad4152834cea69915b379c43e9c4c724e66b5"},"0xe5e6a8112766ceeef0e25d217dab6a9df6e0b3ed":{"idset":["0xc3b88fa916470da44b420bbec7163876474d95040927e3e6d5213557735c4be","0xc75a73f19fd281719b5658260b73b3d9923625e5af7fb29d616c3b3a2280d4ec"]}}}},"status":1}';

const signedOutputContract = "0xb002ff164B54621e5F36d3eeB7cb2dE66F89DcF5";

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

const testHashing =
	'{"sig":"0xb6fe6caae7123c3e1ce2640cfb914bfacb4f41b6fc2f84f406969ca668a7ebd4079c0de067ee5d323b620cc5d46d5f9fe0e12ef18feb0811b6af44af4188fd8a2d","sender":"0xe53508e4594eefa2d03a463e7d66ac640964989d","nonce":"6922120226907108202","recipient":"0xb3fd33b30f9e224d0521b79c73194150648dd300","values":{"0x6b5e665ab94af885657f1edc7674bf3a79beb68b":{"idset":["0x769765eb4327c5f82609a2ea89edc797439d3108930ec6a0ce5277d33c324f47","0xbb970d21666b218bc7efde58be7cf8c7a5ae5bad6ebef77094dcb4740e9449b0"]},"0xc6bde651b4fa5458546df0f4661d230d75ba4970":{"uint":"0xe278f34bbdb943bf627b77ba83ccb16bffef1cbbf29c2d535389776aa9d6fc7d"},"0xbe003d31ef714e903c4f8aa3785f53df1da201ac":{"idset":["0x6d222983926317836b7ae73c70e3f03b78f75356cc09da100acb5b8e712f75b2","0xbaa4daba158d05694898d7a86cf0489defa383166dd0ac3ad096d1d14ef935da","0xd1fadbdbc0f03e4d2acbe2cdda23f1acd968873571b1534ac41b8e9624703b27"]}}}';

const testAttestResponse =
	'{"type":"AttestResponse","data":{"attestation":{"data":{"powDepth":"8961477016931286689","epochDuration":"13554322102892192608","initBlock":"17616681194690307865","tee":"0xdf53528b279758face743687acddb778b405320f","contract":"0x2ed520bb70b2fcca4ac9523c560ab09e5a67823e","tokenHolders":{"ERC20":"0x637923a7b8fc93da8b46b0d110601110268af855","ERC721":"0x4609e699adba3b6c024659f508bca2b89bd273a7","ETH":"0x04a69aa6d41e3b819e9131cd4696357c025228e8"},"network":"Mainnet","nonce":"9247378883234864641","trustedBlockHash":"0x1e43ae3ddcf63a5c7a205f76c0c75e109a11a0f3f670291c1a91b602d1099e8e","trustedBlockNum":"12640263537321728458"},"report":"bVtPvr7Mfi5gswreGE0+fYtFTANkZToi8fs5Cwe6TsLXii//XGAnmpmzMOAR1XnW1NOqZEUR3EkvkTUtPH3VQQ=="}}}';
