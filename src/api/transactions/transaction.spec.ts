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
		genericJSONTest(testTrade, Transaction);
	});
	it("trade ABI test (fees)", () => {
		// Generated randomly in go.
		const testCase: any = {
			contract: Address.fromString(
				"0x77de6fd57874ae9cfa240fbb21e9069bea0b914b",
			),
			tradeTX: TypedJSON.parse(testTrade, Transaction)! as Trade,
			tradeOfferABI:
				'{"contract":"0x77de6fd57874ae9cfa240fbb21e9069bea0b914b","value":{"type":"TradeOffer","value":{"expiry":"10646943390106121795","fees":{"fee":{"0x16d7882d9664e65b58b19f0278c09594828f273b":{"idset":["0xa7b81ba2f9bec0f26f1bee247e0546e04f19a348e312b3ad8f7ba8137171014d","0xe683c1232455918ab7a00d3f80ea8c7cfca1489c34f8ce2410a482d584d430af"]},"0xfefea3d8d81c7bbff97fca924041bdcd2e8009b5":{"uint":"0xb71bec41af48a562f0a269c5d056f834543ceb9b35e8d7904b94a2e68dd90767"}},"market":"0x699d76f2cb73f0685173f62ac1fcf1af48a3accc"},"offer":{"0x4e7f82e302a1441ca6afd8d742398a677e13f864":{"uint":"0x4766e453fb06c898214c4e7f926783259ef40469fa7aa5d55c682bf9411599d3"},"0x6d95523e60874bd7b512cf6ea1a48db47066576c":{"idset":["0x2f585d92b8be3256045cb7e5dc187f84bfd2b40aff963cb9b93ccf5996f846e7","0x9c8f38f5db9c0ef64316009e47fd6906cf705a787d86d6d16965ccfe014175ce"]},"0x8ccc2bbdc7acc4b463e3b5a621e6db39e8525ef5":{"uint":"0x146baa387aa5f6f6eedb9e82214f0bde9e04c76efb5d431b920d37cda6a5781"},"0xb95529fd99352550dd0888681267df6b24bd669f":{"idset":["0xefa813bfa868a80087f7504a28b16621f8b8fc580297e4406411850c4e8c0d63"]}},"owner":"0x5efe5eae5e046a72da6a8a6b14657a31274b5ef8","request":{"0x0b5236a1e337b6c87a7704a262264d1197e6657c":{"uint":"0xe2e155383134f2613b5ef47e1a5c3190e8288287433b07906fd7cd645f273670"},"0x52f274224954e1a4e4c92651ff1503f0ff4cd4a6":{"uint":"0x8685431c894dd9e7d74a7ee91edb3d2d91a5f9892e4f7d5482fb9548fa450f4c"},"0xbb0413f1c6b82f682628cdb82e8bc5b921ac355b":{"uint":"0xc3ead788fc493660e34e7250ddf5a71416c2e414fe46ae817a14934cd285c64e"}}}}}',
			tradeTXABI:
				'{"contract":"0x77de6fd57874ae9cfa240fbb21e9069bea0b914b","value":{"data":{"nonce":"8413251084627809468","offer":{"expiry":"10646943390106121795","fees":{"fee":{"0x16d7882d9664e65b58b19f0278c09594828f273b":{"idset":["0xa7b81ba2f9bec0f26f1bee247e0546e04f19a348e312b3ad8f7ba8137171014d","0xe683c1232455918ab7a00d3f80ea8c7cfca1489c34f8ce2410a482d584d430af"]},"0xfefea3d8d81c7bbff97fca924041bdcd2e8009b5":{"uint":"0xb71bec41af48a562f0a269c5d056f834543ceb9b35e8d7904b94a2e68dd90767"}},"market":"0x699d76f2cb73f0685173f62ac1fcf1af48a3accc"},"offer":{"0x4e7f82e302a1441ca6afd8d742398a677e13f864":{"uint":"0x4766e453fb06c898214c4e7f926783259ef40469fa7aa5d55c682bf9411599d3"},"0x6d95523e60874bd7b512cf6ea1a48db47066576c":{"idset":["0x2f585d92b8be3256045cb7e5dc187f84bfd2b40aff963cb9b93ccf5996f846e7","0x9c8f38f5db9c0ef64316009e47fd6906cf705a787d86d6d16965ccfe014175ce"]},"0x8ccc2bbdc7acc4b463e3b5a621e6db39e8525ef5":{"uint":"0x146baa387aa5f6f6eedb9e82214f0bde9e04c76efb5d431b920d37cda6a5781"},"0xb95529fd99352550dd0888681267df6b24bd669f":{"idset":["0xefa813bfa868a80087f7504a28b16621f8b8fc580297e4406411850c4e8c0d63"]}},"owner":"0x5efe5eae5e046a72da6a8a6b14657a31274b5ef8","request":{"0x0b5236a1e337b6c87a7704a262264d1197e6657c":{"uint":"0xe2e155383134f2613b5ef47e1a5c3190e8288287433b07906fd7cd645f273670"},"0x52f274224954e1a4e4c92651ff1503f0ff4cd4a6":{"uint":"0x8685431c894dd9e7d74a7ee91edb3d2d91a5f9892e4f7d5482fb9548fa450f4c"},"0xbb0413f1c6b82f682628cdb82e8bc5b921ac355b":{"uint":"0xc3ead788fc493660e34e7250ddf5a71416c2e414fe46ae817a14934cd285c64e"}},"sig":"0x006f1d7bf1bf52af4500436efe15a1bb01157de55bd63c8502921336496137260de7a551aee35644cc48d83208c045c66a479c1fe92d5529805d4b01f9ed447a1c"},"sender":"0xf0ff1ac785b753771b48ca6f5befa2ea0820b8f4"},"type":"Trade"}}',
		};
		const offer = testCase.tradeTX.offer;
		expect(offer.fees).to.exist;
		expect(utils.toUtf8String(offer.packTagged(testCase.contract).bytes)).eql(
			testCase.tradeOfferABI,
		);
		expect(
			utils.toUtf8String(testCase.tradeTX.packTagged(testCase.contract).bytes),
		).eql(testCase.tradeTXABI);
	});

	it("trade ABI test (no fees)", () => {
		// Generated randomly in go.
		const testCase: any = {
			contract: Address.fromString(
				"0x77de6fd57874ae9cfa240fbb21e9069bea0b914b",
			),
			tradeTX: TypedJSON.parse(
				'{"sig":"0x162af805457e830e72c80f70db398144e830bc7ce6d5f6306e93b73bbd04e32339e22fb075373193edafbdddb8fd154c36d9f01b211907578b044beba9e96bf61c","sender":"0xf0ff1ac785b753771b48ca6f5befa2ea0820b8f4","nonce":"2153640297116383103","offer":{"sig":"0xb75328b8e4f948c3caf5b85e2d9a78e73dc5e8ba26cc0a51b323d1cd5956079366ff33087d18bdec244235d055074470d3f8569451d672a16555e63d3801e42b1b","owner":"0x5efe5eae5e046a72da6a8a6b14657a31274b5ef8","offer":{"0xc510e8e2fffc29ee75d71704ed75d1b16aafd855":{"idset":["0x131062631bbdbc05fa858aa36d93857125876cd065e50a7ca97902817eec67e0","0x6b7b91c52df0e8c17b11dc8e00aa2868e9c42ea426518e0ea33288fb8802bfc7","0x8c674134d92398c6a3a8c9568456f1dda0c3beaa9a91d70b6b7364a916e185fe","0xb519de8681e9d329df6eb20a645a2e163617e2b1f97ac555736959a3a4dda210"]},"0x584f4e7ba91ddf95707d0658f61ee57fb1b4c9cf":{"uint":"0xecbb153ff521c55ecd32e20ee3da44abb78caa6ae9b99215ea4d09a48d668b38"},"0xd2ec7baab76284e6afe5a19548b6077e7e2b29dd":{"uint":"0x816774cb1f22ea94db01e89d9f842cd6080d5ecf5f82568effa68059ea6dcf85"},"0x483460d129754585f9f93cbf81d68f030177bc82":{"uint":"0x28b8b2a15d5adb95d69128fe95a1fa19e94969bc2b2308023f27d40439cdebb2"}},"expiry":"2582351591733554214","request":{"0x309097f8126a84eef751b538ff90f7587cf6cecb":{"uint":"0xf707a1938c1cf925433ac6cb9a21244313002bda56c2514735bd63667d96754d"},"0xa6fb8a1afec6aa1e2b2029e39429e50038f3ed2a":{"uint":"0x2905a7b94e37bfdbad11c18efb58ffcdef019ae910efad25219b610d24ab5f55"},"0xf7c84167cb99b2b622cf2f10a13e50d2a643daed":{"uint":"0xc3649f801a9455902d3d6aea6807756c312c3d9737d30ca529c693e89f56c8aa"}}}}',
				Trade,
			)!,
			tradeOfferABI:
				'{"contract":"0x77de6fd57874ae9cfa240fbb21e9069bea0b914b","value":{"type":"TradeOffer","value":{"expiry":"2582351591733554214","offer":{"0x483460d129754585f9f93cbf81d68f030177bc82":{"uint":"0x28b8b2a15d5adb95d69128fe95a1fa19e94969bc2b2308023f27d40439cdebb2"},"0x584f4e7ba91ddf95707d0658f61ee57fb1b4c9cf":{"uint":"0xecbb153ff521c55ecd32e20ee3da44abb78caa6ae9b99215ea4d09a48d668b38"},"0xc510e8e2fffc29ee75d71704ed75d1b16aafd855":{"idset":["0x131062631bbdbc05fa858aa36d93857125876cd065e50a7ca97902817eec67e0","0x6b7b91c52df0e8c17b11dc8e00aa2868e9c42ea426518e0ea33288fb8802bfc7","0x8c674134d92398c6a3a8c9568456f1dda0c3beaa9a91d70b6b7364a916e185fe","0xb519de8681e9d329df6eb20a645a2e163617e2b1f97ac555736959a3a4dda210"]},"0xd2ec7baab76284e6afe5a19548b6077e7e2b29dd":{"uint":"0x816774cb1f22ea94db01e89d9f842cd6080d5ecf5f82568effa68059ea6dcf85"}},"owner":"0x5efe5eae5e046a72da6a8a6b14657a31274b5ef8","request":{"0x309097f8126a84eef751b538ff90f7587cf6cecb":{"uint":"0xf707a1938c1cf925433ac6cb9a21244313002bda56c2514735bd63667d96754d"},"0xa6fb8a1afec6aa1e2b2029e39429e50038f3ed2a":{"uint":"0x2905a7b94e37bfdbad11c18efb58ffcdef019ae910efad25219b610d24ab5f55"},"0xf7c84167cb99b2b622cf2f10a13e50d2a643daed":{"uint":"0xc3649f801a9455902d3d6aea6807756c312c3d9737d30ca529c693e89f56c8aa"}}}}}',
			tradeTXABI:
				'{"contract":"0x77de6fd57874ae9cfa240fbb21e9069bea0b914b","value":{"data":{"nonce":"2153640297116383103","offer":{"expiry":"2582351591733554214","offer":{"0x483460d129754585f9f93cbf81d68f030177bc82":{"uint":"0x28b8b2a15d5adb95d69128fe95a1fa19e94969bc2b2308023f27d40439cdebb2"},"0x584f4e7ba91ddf95707d0658f61ee57fb1b4c9cf":{"uint":"0xecbb153ff521c55ecd32e20ee3da44abb78caa6ae9b99215ea4d09a48d668b38"},"0xc510e8e2fffc29ee75d71704ed75d1b16aafd855":{"idset":["0x131062631bbdbc05fa858aa36d93857125876cd065e50a7ca97902817eec67e0","0x6b7b91c52df0e8c17b11dc8e00aa2868e9c42ea426518e0ea33288fb8802bfc7","0x8c674134d92398c6a3a8c9568456f1dda0c3beaa9a91d70b6b7364a916e185fe","0xb519de8681e9d329df6eb20a645a2e163617e2b1f97ac555736959a3a4dda210"]},"0xd2ec7baab76284e6afe5a19548b6077e7e2b29dd":{"uint":"0x816774cb1f22ea94db01e89d9f842cd6080d5ecf5f82568effa68059ea6dcf85"}},"owner":"0x5efe5eae5e046a72da6a8a6b14657a31274b5ef8","request":{"0x309097f8126a84eef751b538ff90f7587cf6cecb":{"uint":"0xf707a1938c1cf925433ac6cb9a21244313002bda56c2514735bd63667d96754d"},"0xa6fb8a1afec6aa1e2b2029e39429e50038f3ed2a":{"uint":"0x2905a7b94e37bfdbad11c18efb58ffcdef019ae910efad25219b610d24ab5f55"},"0xf7c84167cb99b2b622cf2f10a13e50d2a643daed":{"uint":"0xc3649f801a9455902d3d6aea6807756c312c3d9737d30ca529c693e89f56c8aa"}},"sig":"0xb75328b8e4f948c3caf5b85e2d9a78e73dc5e8ba26cc0a51b323d1cd5956079366ff33087d18bdec244235d055074470d3f8569451d672a16555e63d3801e42b1b"},"sender":"0xf0ff1ac785b753771b48ca6f5befa2ea0820b8f4"},"type":"Trade"}}',
		};
		const offer = testCase.tradeTX.offer;
		expect(offer.fees).to.be.undefined;
		expect(utils.toUtf8String(offer.packTagged(testCase.contract).bytes)).eql(
			testCase.tradeOfferABI,
		);
		expect(
			utils.toUtf8String(testCase.tradeTX.packTagged(testCase.contract).bytes),
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
			"0x42b44501d36cf32c3fd41a7f404cbce99b5cbda38c5244d7cb1bfed3cc441eda",
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
	'{"type":"Trade","data":{"sig":"0x2c73419636d07a1a9318f046d1b4e3b61508d001e45753e5973993efa23a7fe406d6b54df1353e3519379bd2f9ed36b87bfbdea7f25bf45ec7320405815aa68c1b","sender":"0xf0ff1ac785b753771b48ca6f5befa2ea0820b8f4","nonce":"8413251084627809468","offer":{"sig":"0x006f1d7bf1bf52af4500436efe15a1bb01157de55bd63c8502921336496137260de7a551aee35644cc48d83208c045c66a479c1fe92d5529805d4b01f9ed447a1c","owner":"0x5efe5eae5e046a72da6a8a6b14657a31274b5ef8","offer":{"0x4e7f82e302a1441ca6afd8d742398a677e13f864":{"uint":"0x4766e453fb06c898214c4e7f926783259ef40469fa7aa5d55c682bf9411599d3"},"0x8ccc2bbdc7acc4b463e3b5a621e6db39e8525ef5":{"uint":"0x146baa387aa5f6f6eedb9e82214f0bde9e04c76efb5d431b920d37cda6a5781"},"0xb95529fd99352550dd0888681267df6b24bd669f":{"idset":["0xefa813bfa868a80087f7504a28b16621f8b8fc580297e4406411850c4e8c0d63"]},"0x6d95523e60874bd7b512cf6ea1a48db47066576c":{"idset":["0x2f585d92b8be3256045cb7e5dc187f84bfd2b40aff963cb9b93ccf5996f846e7","0x9c8f38f5db9c0ef64316009e47fd6906cf705a787d86d6d16965ccfe014175ce"]}},"expiry":"10646943390106121795","request":{"0x0b5236a1e337b6c87a7704a262264d1197e6657c":{"uint":"0xe2e155383134f2613b5ef47e1a5c3190e8288287433b07906fd7cd645f273670"},"0x52f274224954e1a4e4c92651ff1503f0ff4cd4a6":{"uint":"0x8685431c894dd9e7d74a7ee91edb3d2d91a5f9892e4f7d5482fb9548fa450f4c"},"0xbb0413f1c6b82f682628cdb82e8bc5b921ac355b":{"uint":"0xc3ead788fc493660e34e7250ddf5a71416c2e414fe46ae817a14934cd285c64e"}},"fees":{"market":"0x699d76f2cb73f0685173f62ac1fcf1af48a3accc","fee":{"0xfefea3d8d81c7bbff97fca924041bdcd2e8009b5":{"uint":"0xb71bec41af48a562f0a269c5d056f834543ceb9b35e8d7904b94a2e68dd90767"},"0x16d7882d9664e65b58b19f0278c09594828f273b":{"idset":["0xa7b81ba2f9bec0f26f1bee247e0546e04f19a348e312b3ad8f7ba8137171014d","0xe683c1232455918ab7a00d3f80ea8c7cfca1489c34f8ce2410a482d584d430af"]}}}}}}';

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
	'{"sig":"0x542ed7ce3ffdbd824d8436cf2ccabff42c73684593db03f78cd508ddc69fb6b82a5ba24c9571e376966f0549a200423c3eb2ee6d78c704d4baccdcdb5067b4f51b","sender":"0x1fdf4cb85cc01d7db6fea97bf8fff5060db7818d","nonce":"5737860732460206373","recipient":"0x28a6ebb04a4e61e209572e1e082925d1851b7033","values":{"0x8336a29e7ca44be92ea6d518292956d987976fc7":{"idset":["0x594f952dbdfc1a1ec2dbff16c52ebccd84b9b050f84fedffae63cb504f5e4b53"]},"0x0e5eaf8ee8a31b3956f372c41a4a1ed22229e74a":{"idset":["0xd3ec92733d39b153e54242083ee10badaa0aec90919ec5417054d295c3a41329"]},"0x9e05340a1ada03d197ca26a9d03a822b061fd74f":{"uint":"0x4fd415d5b2e30a092d2f4e79d0ec3616d9925de3cd071ec4fa17cf534414a473"}}}';

const testAttestResponse =
	'{"type":"AttestResponse","data":{"attestation":{"data":{"powDepth":"8961477016931286689","epochDuration":"13554322102892192608","initBlock":"17616681194690307865","tee":"0xdf53528b279758face743687acddb778b405320f","contract":"0x2ed520bb70b2fcca4ac9523c560ab09e5a67823e","tokenHolders":{"ERC20":"0x637923a7b8fc93da8b46b0d110601110268af855","ERC721":"0x4609e699adba3b6c024659f508bca2b89bd273a7","ETH":"0x04a69aa6d41e3b819e9131cd4696357c025228e8"},"network":"Mainnet","nonce":"9247378883234864641","trustedBlockHash":"0x1e43ae3ddcf63a5c7a205f76c0c75e109a11a0f3f670291c1a91b602d1099e8e","trustedBlockNum":"12640263537321728458"},"report":"bVtPvr7Mfi5gswreGE0+fYtFTANkZToi8fs5Cwe6TsLXii//XGAnmpmzMOAR1XnW1NOqZEUR3EkvkTUtPH3VQQ=="}}}';
