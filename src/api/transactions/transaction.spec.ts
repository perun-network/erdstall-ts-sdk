// SPDX-License-Identifier: Apache-2.0
"use strict";

import "reflect-metadata";
import { describe, it } from "mocha";
import "../..";
import { TypedJSON } from "typedjson";
import { Call, Result, ErdstallObject } from "..";
import { expect } from "chai";
import { BalanceProofs } from "../responses/balanceproof";
import { Transaction, Trade } from ".";
import { Address } from "../../ledger";
import { utils } from "ethers";

describe("Wiremessages", () => {
	it("de-/encodes subscriptions", () => {
		genericJSONTest(testSubscribeTXs, Call);
		genericJSONTest(testSubscribeBalanceProofs, Call);
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
	it("de-/encodes mints", () => {
		genericJSONTest(testMint, Call);
	});
	it("de-/encodes trades", () => {
		genericJSONTest(testTrade, Call);
	});
	it("trade ABI test (fees)", () => {
		const contract = Address.fromString("0x6e2FD8A6FB6caf3612967AadC749763e9657e9D1");
		const tradeCall = TypedJSON.parse(testTrade, Call)!;
		let tradeTx = tradeCall.data as Transaction as Trade;
		expect(tradeTx.offer.fees).to.exist;
		let offer = tradeTx.offer;
		expect(utils.hexlify(offer.asABITagged(contract).bytes)).eql("0x00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000853e4adb7133a2428f9110d6fe90528f952c9b8a00000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000001d6b500e63ff2af00000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000062000000000000000000000000000000000000000000000000000000000000000124572647374616c6c54726164654f66666572000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000260000000000000000000000000864d521069db48e3ecc0fb37758fe390ffc52792000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000206c0586c8342049adb937086313fb85455a9c12dff262d0e450e148abac29d8cb0000000000000000000000008930626eb9d0021f4c55112252ba3d204ce042650000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004033f7ef5bcef66ea157f22ece0b7941897c67fa4bb2fd8d1af25224e9a2d24fcef2c182b9a127700c4025f9ec0c98cc35b94d51c88aa553cfd096b97f7586e2be00000000000000000000000090a178bdf2018e4cb104b28f6276cdfa0e32f1fd0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006038424b50e731a15664fc82bb4d7a9288a20effb7092a477a30f3eca90122c7dc5d4350a213f20b5c521a7877e09ff95d7eee15c975c8280b952a2fa57ad8bac584f9d82636fe8a455a57af682c1a88fedf173ae0c17af601496d643b09f590c9000000000000000000000000ab5e120e45085aaaaac8f81d21087c8c6cec81ce00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020617683715581a365caf4354ecb69b248fbde705ccdbd33b6ef3048344407ea920000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000ac15eca362aeae4876e76fbd5648130e8f123f290000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002066cccdc1cb7da5c70669401f4b617b26a69ae3df1598d4a781f9927b6b42a5ce000000000000000000000000d26267f82969fba5d6be0986f5a505f1604107b5000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000207932032e2e9e3ca0183fa006dcf696e2263b04ab84da3c907afb98c50b3ffa0d000000000000000000000000d740ae29e3d69e2f42899e413381e1553840f72a00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020133cfb4f6aafb36324186e6c6da8d56cf1812d048e5a39f3db714c2a195b042d000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000800000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d100000000000000000000000049ed509ee584a17987156e276f180b234e79292c00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000114572647374616c6c5472616465466565730000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000035b7ef7803eb1a954517ee58aa9ea5964afd44ce000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000203aeb4f544769e0a8dd5ab3d2a8569336cadeb54db0af60cf79c5c13f8b1c1b86000000000000000000000000ccf0fbe58471cb5e6e4bf25fddb8f8709b24f1fc00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020118d5931da69e0069fcb94ef71e248bb22379080bd8983dda622c7c9a59416df");

		expect(utils.hexlify(tradeTx.asABITagged(contract).bytes)).eql("0x00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000cc7b33980df2ed446b3ece6598ddd4a0373ac86f0000000000000000000000000000000000000000000000008b7b899853b7799c00000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000000f4572647374616c6c54726164655458000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000410a608b36448f0ffb2ba265fc031cc7ec31ac44bd7185a72661afef805c8e06465fc4ccbcc4ed2790ec003dbb7584da98a264b47a553c1bbab087c882890813ce1c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000086000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000853e4adb7133a2428f9110d6fe90528f952c9b8a00000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000001d6b500e63ff2af00000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000062000000000000000000000000000000000000000000000000000000000000000124572647374616c6c54726164654f66666572000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000260000000000000000000000000864d521069db48e3ecc0fb37758fe390ffc52792000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000206c0586c8342049adb937086313fb85455a9c12dff262d0e450e148abac29d8cb0000000000000000000000008930626eb9d0021f4c55112252ba3d204ce042650000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004033f7ef5bcef66ea157f22ece0b7941897c67fa4bb2fd8d1af25224e9a2d24fcef2c182b9a127700c4025f9ec0c98cc35b94d51c88aa553cfd096b97f7586e2be00000000000000000000000090a178bdf2018e4cb104b28f6276cdfa0e32f1fd0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006038424b50e731a15664fc82bb4d7a9288a20effb7092a477a30f3eca90122c7dc5d4350a213f20b5c521a7877e09ff95d7eee15c975c8280b952a2fa57ad8bac584f9d82636fe8a455a57af682c1a88fedf173ae0c17af601496d643b09f590c9000000000000000000000000ab5e120e45085aaaaac8f81d21087c8c6cec81ce00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020617683715581a365caf4354ecb69b248fbde705ccdbd33b6ef3048344407ea920000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000ac15eca362aeae4876e76fbd5648130e8f123f290000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002066cccdc1cb7da5c70669401f4b617b26a69ae3df1598d4a781f9927b6b42a5ce000000000000000000000000d26267f82969fba5d6be0986f5a505f1604107b5000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000207932032e2e9e3ca0183fa006dcf696e2263b04ab84da3c907afb98c50b3ffa0d000000000000000000000000d740ae29e3d69e2f42899e413381e1553840f72a00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020133cfb4f6aafb36324186e6c6da8d56cf1812d048e5a39f3db714c2a195b042d000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000800000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d100000000000000000000000049ed509ee584a17987156e276f180b234e79292c00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000114572647374616c6c5472616465466565730000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000035b7ef7803eb1a954517ee58aa9ea5964afd44ce000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000203aeb4f544769e0a8dd5ab3d2a8569336cadeb54db0af60cf79c5c13f8b1c1b86000000000000000000000000ccf0fbe58471cb5e6e4bf25fddb8f8709b24f1fc00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020118d5931da69e0069fcb94ef71e248bb22379080bd8983dda622c7c9a59416df");
	});

	it("trade ABI test (no fees)", () => {
		const contract = Address.fromString("0x6e2FD8A6FB6caf3612967AadC749763e9657e9D1");
		const tradeTx = TypedJSON.parse('{"sig":"0x4fda8964bb4929ed959b8efc6246686c0c851dd1b2f5ff13e7822e6a120544b5547ed6585b25e56602b616b9ac1fc640c387b329178df9bb9f8f0839a6b7c5e11b","sender":"0xcc7b33980df2ed446b3ece6598ddd4a0373ac86f","nonce":"3154030767102693157","offer":{"sig":"0x1935fa389c56ae1deb654b443bd060aa7c58ce97c26ab2bf66f6e9fb85993c1479961b5d96d4c75d80766ae921fb2c81540a5a4686ac37a319e401d031f0a83b1b","owner":"0x853e4adb7133a2428f9110d6fe90528f952c9b8a","offer":{"0x074B0E4cEA85fe6CfEaa1FA5B78aAa137b6C25bA":{"uint":"0x6a2725d52f730ffad9aeaad635512ff952da8971fc39c459e4070a8247cafd86"},"0xBB4e8bD29bbC6c51F7C6204fA131bbF5dE8C7D44":{"uint":"0x9fd4c0687e0f8e85a150bf90b77cbca7f0fec4b9cc8cd97aca91f00e874854f0"},"0xB2F30aCb3D83Eb5310796e3374bE07FcBAeaF8cF":{"uint":"0x178b5ea097edc5fc1ce84a83cb70ada998175f31bb1a81ee1545ec1f27bb9f2f"},"0x0264c08e7381e5275Db666CE3963caD731b71082":{"uint":"0x2f377d8541c4f898abb0d46aad3bc32250270c3faed5a2fc9b66eb57a835d079"}},"expiry":"3510488203188983396","request":{"0x1B8C723CFc1085deBDC8149fea278ddA2CDB7861":{"idset":["0x5208cfd459064675857e2762b5d737508c6ef48c56368cd383a80d6cb5b8ee9c","0xa03135f543d627c14826ab8d9958fb034a332424dae01c6ac25fb18b55cc6c02","0xf93f1b36d53b9f1b53ef620758d817602d6ba4046d3090816af8dc45444645ae"]},"0x63A648217cA03A44A0168d6Ca8aaF633F7c17995":{"uint":"0xd7b959541314b6b5d927cd0fb7bb286594a7e24da98ca89973db17598f0d9e60"},"0xA4608979e027ac444Cc34E2D754EE99E7d2Be147":{"uint":"0x79ede6b960bd5b7b983b935df0cd75c67a4f6335d5da5c2622a77487074ea423"}}}}', Trade)!;
		expect(tradeTx.offer.fees).to.not.exist;
		expect(utils.hexlify(tradeTx.offer.asABITagged(contract).bytes)).eql("0x00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000853e4adb7133a2428f9110d6fe90528f952c9b8a000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000030b7c26be347566400000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000124572647374616c6c54726164654f666665720000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000264c08e7381e5275db666ce3963cad731b71082000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000202f377d8541c4f898abb0d46aad3bc32250270c3faed5a2fc9b66eb57a835d079000000000000000000000000074b0e4cea85fe6cfeaa1fa5b78aaa137b6c25ba000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000206a2725d52f730ffad9aeaad635512ff952da8971fc39c459e4070a8247cafd86000000000000000000000000b2f30acb3d83eb5310796e3374be07fcbaeaf8cf00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020178b5ea097edc5fc1ce84a83cb70ada998175f31bb1a81ee1545ec1f27bb9f2f000000000000000000000000bb4e8bd29bbc6c51f7c6204fa131bbf5de8c7d44000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000209fd4c0687e0f8e85a150bf90b77cbca7f0fec4b9cc8cd97aca91f00e874854f000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000001b8c723cfc1085debdc8149fea278dda2cdb7861000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000605208cfd459064675857e2762b5d737508c6ef48c56368cd383a80d6cb5b8ee9ca03135f543d627c14826ab8d9958fb034a332424dae01c6ac25fb18b55cc6c02f93f1b36d53b9f1b53ef620758d817602d6ba4046d3090816af8dc45444645ae00000000000000000000000063a648217ca03a44a0168d6ca8aaf633f7c1799500000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020d7b959541314b6b5d927cd0fb7bb286594a7e24da98ca89973db17598f0d9e60000000000000000000000000a4608979e027ac444cc34e2d754ee99e7d2be1470000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002079ede6b960bd5b7b983b935df0cd75c67a4f6335d5da5c2622a77487074ea4230000000000000000000000000000000000000000000000000000000000000000");
		expect(utils.hexlify(tradeTx.asABITagged(contract).bytes)).eql("0x00000000000000000000000000000000000000000000000000000000000000c00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000cc7b33980df2ed446b3ece6598ddd4a0373ac86f0000000000000000000000000000000000000000000000002bc55e459bcf0f2500000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000000f4572647374616c6c54726164655458000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000411935fa389c56ae1deb654b443bd060aa7c58ce97c26ab2bf66f6e9fb85993c1479961b5d96d4c75d80766ae921fb2c81540a5a4686ac37a319e401d031f0a83b1b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000062000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000006e2fd8a6fb6caf3612967aadc749763e9657e9d1000000000000000000000000853e4adb7133a2428f9110d6fe90528f952c9b8a000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000030b7c26be347566400000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000124572647374616c6c54726164654f666665720000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000264c08e7381e5275db666ce3963cad731b71082000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000202f377d8541c4f898abb0d46aad3bc32250270c3faed5a2fc9b66eb57a835d079000000000000000000000000074b0e4cea85fe6cfeaa1fa5b78aaa137b6c25ba000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000206a2725d52f730ffad9aeaad635512ff952da8971fc39c459e4070a8247cafd86000000000000000000000000b2f30acb3d83eb5310796e3374be07fcbaeaf8cf00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020178b5ea097edc5fc1ce84a83cb70ada998175f31bb1a81ee1545ec1f27bb9f2f000000000000000000000000bb4e8bd29bbc6c51f7c6204fa131bbf5de8c7d44000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000209fd4c0687e0f8e85a150bf90b77cbca7f0fec4b9cc8cd97aca91f00e874854f000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000001b8c723cfc1085debdc8149fea278dda2cdb7861000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000605208cfd459064675857e2762b5d737508c6ef48c56368cd383a80d6cb5b8ee9ca03135f543d627c14826ab8d9958fb034a332424dae01c6ac25fb18b55cc6c02f93f1b36d53b9f1b53ef620758d817602d6ba4046d3090816af8dc45444645ae00000000000000000000000063a648217ca03a44a0168d6ca8aaf633f7c1799500000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000020d7b959541314b6b5d927cd0fb7bb286594a7e24da98ca89973db17598f0d9e60000000000000000000000000a4608979e027ac444cc34e2d754ee99e7d2be1470000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002079ede6b960bd5b7b983b935df0cd75c67a4f6335d5da5c2622a77487074ea4230000000000000000000000000000000000000000000000000000000000000000");
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
	'{"type":"BalanceProofs","data":{"0x923439be515b6a928cb9650d70000a9044e49e85":{"balance":{"epoch":"53","account":"0x923439be515b6a928cb9650d70000a9044e49e85","values":{"0x079557d7549d7D44F4b00b51d2C532674129ed51":{"uint":"0x3cfc82e37e9a7400000"}},"exit":false},"sig":"0xc93a0443d473783cf927dc1ccc17026b613ef3ceda5625c77949a07f2aa3b39253f1cc02b838e74afca27ff77e67493d9e20e1b36faf41dec442169d0d8851be1c"},"0xb5d05705c467bfed944b6769a689c7766cc1f805":{"balance":{"epoch":"53","account":"0xb5d05705c467bfed944b6769a689c7766cc1f805","values":{"0x079557d7549d7D44F4b00b51d2C532674129ed51":{"uint":"0xcff253a09503f9c00000"}},"exit":false},"sig":"0xe2cda7c66ce85bbcc25bafee085421bb38ce496f2052a05d9a78ef1238df41696b37217c4cf6c4dc885b42a6c756cbf08af7334ec5a33615d1465b62973a40c71c"}}}';

const testClientConfig =
	'{"data":{"type":"ClientConfig","data":{"networkID":"1337","contract":"0x923439be515b6a928cb9650d70000a9044e49e85","powDepth":0}}}';

const testTxReceipt =
	'{"data":{"type":"TxReceipt","data":{"tx":{"type":"Transfer","data":{"sig":"0xa6b8584f39c1bb23ce03827e5cae30114644c366a6f8fa7e464ebca80876a3274fef1afe03d80bb98d21d58e1acf92aa3aa02379355d0c81e93fe31698b24647bd","nonce":"4272861793665600370","sender":"0x3dae4441eaeea77abe337d13b50487205145f3d2","recipient":"0x825e7acaefe9158ce8456203eab45d0fd2e1af1e","values":{"0x455498D5602567d0c3260b5F5381Bfb78656f4Bc":{"idset":["0xee62c50552814a6281e97c96229475523b9d5e635f5c2781e9f8863b607f2f4a"]},"0x732F36D2e8B0C49d0c1F76Dab1Fa71E7De029Bf4":{"uint":"0xba139d5cb39c33b042412d3c038d33c35d44a0bf02d8fbfbe97b6f8c1dcc27d0"},"0x3A18a4e6EF6e780f85C501E3edF96ADC9F1eD4a8":{"idset":["0x30a1aef871e1d4831f15e06760e5cb6654904691bfcd56b4b6012aea1c185dfc","0x9f174ed2ac5cae3af1b202689f295dd46ab8c12057f3142f00bbac37d2f4255b","0xd7cba7b6d048de46b09de69b6d9dbf685b2a1918be50608a199095b14fad396a"]}}}},"account":{"nonce":"1778407585292477669","values":{"0x7f3072cfbAbb02A6FeF67D124D977D4eC71D8435":{"idset":["0x476dc77a1af8ca374d09240305eeaa856a3e54bb1c24c2a27312a132b1153013","0xf6e3561549e6d2a1c469883a02daf73b4284ab8233b8f4c0b6497c79453f84b0"]},"0x7D19874796e76b0F5a3B5dcDC0c0eddBE491c972":{"uint":"0xee400e9a5a67913b3f19379b2fe53b8cda76196f25ab40a4bc5b7cd9873261ef"},"0xaaA6AeA2EE1aBfFF3eD6106699DaD11CB5573334":{"idset":["0x34b37b5d4b4dd782303bb5a05d3e16cdc3f2717cf4ceae8c6af44dfec9bf1dec","0x71af4acca7dd61014f74208f61645c44cafbd12a2385ea8bdd3123ed5efa610b"]}},"locked":{"0x9430490E2a9ed89A09a1B87e0F77979f895f0CE1":{"idset":["0x231243292fa026d6b290d6d9e5bd4fbbff8b74f12c9c0afe646a99dd6ba8e2e1","0x9b4ce56c90f553971def194605386506befd469b1d1c3ab86732dc0e3b663d64","0xf33ab366cc92f61bef0ec5215df31a34f14b69a660a32a8eb58212a6b185bf56"]},"0x8e53A74656780616EE70cA396423eB4384A862fd":{"idset":["0x8726a611c93ffc1a0bcab6f1be9b38542ce9214b8d10b7ad82be918cd39bb454"]},"0xf35bb68687A12874aB19217379e35B7218F139b0":{"idset":["0x7282a34a48f47b161998d85b93e4eb7b9af40670bcdcd225df371014b4687ddd","0x952918b2af1215de4a512914f98a08badca482df8ade59088d1c6216b416c375"]}}}}}}';

const testTransfer =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Transfer","data":{"sig":"0x4702a782ed2cec2d0f6a3033b0b5cc4628da33cabf84c4c61d50ed2676eb00dd5f8738c56c1c4bb9b0372b0ac934ceff9963afc509534bef5410c67e04d946e5f6","nonce":"216021471606088551","sender":"0xaac91eb099bfedca2bb0c7c0242dd1a6533a8bad","recipient":"0x8121a1e0f4eec3ae4006699df217695e94a9bc50","values":{"0xBCA5e7a4BCd379Ed0A508658185804607d3e660C":{"uint":"0x1de2b278042605c0af89c122064c942730ff97a82d2a0c1bd5506818d2341241"},"0x668916e2947cb3430f586Bd2C560a47cF8235c92":{"uint":"0xdb0e3b634d3c871dc7158488d50e25e860fc6daba25f39c917ed5993b32e3469"},"0x37C5Dfc28c5A448dDc2868a64aaD17362a6d0088":{"uint":"0x81987ded1cd1e4e1f6de6bdfa410c9815115d8cf3e131e3b010978c400a2edd5"}}}}}}';

const testExitRequest =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"ExitRequest","data":{"sig":"0x525612193533644d30fe57e6e8e1979319b3e6eae975ed2df3252c43c3ae721476cbf9d74aef61c1294704cc00a7ec36aa6e2181127831f57d6f0518e0c459b7c0","nonce":"1863693455832366668","sender":"0x972cb3cc31ba2b845a52c6abaefcd5f09f7ba678"}}}}';

const testMint =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Mint","data":{"sig":"0x567f6956646dbc537ac6239f87e78416149ad102abf78f093a373ff6a283284f93853af25d07327b9135c6499c1c28fd6082be0563ddd559ac554d4a78eff61bad","nonce":"3424314417749617446","sender":"0x1be64a84d68c5cb92640eb7f64336fe5e180b676","token":"0x3c85ef52db875ca7a3ccaaedcc6fc86a25621b90","id":"123485"}}}}';

const testTrade = '{"id":"an-id","data":{"type":"Transaction","data":{"type":"Trade","data":{"sig":"0x91f37b5382eaa82851faf5066aac2e72a9253890c6601f3c5b33d2cce20388790e366482256e22a9e8c876d5119d1b99ac313ae53ce460fdaad74e067c9f9deb1c","sender":"0xcc7b33980df2ed446b3ece6598ddd4a0373ac86f","nonce":"10050778280739961244","offer":{"sig":"0x0a608b36448f0ffb2ba265fc031cc7ec31ac44bd7185a72661afef805c8e06465fc4ccbcc4ed2790ec003dbb7584da98a264b47a553c1bbab087c882890813ce1c","owner":"0x853e4adb7133a2428f9110d6fe90528f952c9b8a","offer":{"0x8930626eb9d0021F4c55112252ba3D204Ce04265":{"idset":["0x33f7ef5bcef66ea157f22ece0b7941897c67fa4bb2fd8d1af25224e9a2d24fce","0xf2c182b9a127700c4025f9ec0c98cc35b94d51c88aa553cfd096b97f7586e2be"]},"0x90A178BDf2018E4cB104b28f6276cDFa0e32F1fD":{"idset":["0x38424b50e731a15664fc82bb4d7a9288a20effb7092a477a30f3eca90122c7dc","0x5d4350a213f20b5c521a7877e09ff95d7eee15c975c8280b952a2fa57ad8bac5","0x84f9d82636fe8a455a57af682c1a88fedf173ae0c17af601496d643b09f590c9"]},"0x864d521069dB48E3eCC0fB37758Fe390ffc52792":{"uint":"0x6c0586c8342049adb937086313fb85455a9c12dff262d0e450e148abac29d8cb"},"0xaB5E120E45085AaaaaC8f81d21087C8C6ceC81cE":{"uint":"0x617683715581a365caf4354ecb69b248fbde705ccdbd33b6ef3048344407ea92"}},"expiry":"2119876072345381616","request":{"0xD26267f82969fBA5d6Be0986f5a505F1604107B5":{"uint":"0x7932032e2e9e3ca0183fa006dcf696e2263b04ab84da3c907afb98c50b3ffa0d"},"0xD740AE29e3D69E2F42899e413381E1553840F72A":{"uint":"0x133cfb4f6aafb36324186e6c6da8d56cf1812d048e5a39f3db714c2a195b042d"},"0xAC15Eca362aeAe4876E76fBD5648130E8F123f29":{"uint":"0x66cccdc1cb7da5c70669401f4b617b26a69ae3df1598d4a781f9927b6b42a5ce"}},"fees":{"market":"0x49ed509ee584a17987156e276f180b234e79292c","fee":{"0x35b7Ef7803EB1A954517Ee58AA9eA5964afd44CE":{"idset":["0x3aeb4f544769e0a8dd5ab3d2a8569336cadeb54db0af60cf79c5c13f8b1c1b86"]},"0xccf0Fbe58471Cb5E6E4Bf25fdDb8f8709b24F1Fc":{"idset":["0x118d5931da69e0069fcb94ef71e248bb22379080bd8983dda622c7c9a59416df"]}}}}}}}}';

const testError = '{"id":"an-id","error":"could not get proof"}';

const testSubscribeTXs =
	'{"id":"an-id","data":{"type":"SubscribeTXs","data":{"who":"0x92aaff3bba15f99960d54074ed2464c337fee0ab", "cancel": false}}}';
const testSubscribeBalanceProofs =
	'{"id":"an-id","data":{"type":"SubscribeBalanceProofs","data":{"who":"0x92aaff3bba15f99960d54074ed2464c337fee0ab", "cancel": false}}}';
