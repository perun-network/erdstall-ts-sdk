// SPDX-License-Identifier: Apache-2.0
"use strict";

import "reflect-metadata";
import { describe, it } from "mocha";
import { TypedJSON } from "#erdstall/export/typedjson";
import { Call, Result, ErdstallObject } from "#erdstall/api";
import { TxReceipt } from "#erdstall/api/responses";
import { expect } from "chai";
import { registerAddressType, registerSignatureType } from "#erdstall/crypto";
import { Transfer } from "./transfer";
import { TestAddress, TestSignature } from "#erdstall/test";

registerAddressType("test", TestAddress);
registerSignatureType("test", TestSignature);

describe("Wiremessages", () => {
	it("de-/encodes subscriptions", () => {
		genericJSONTest(testSubscribeTXs, Call);
		genericJSONTest(testSubscribeBalanceProofs, Call);
		genericJSONTest(testSubscribePhaseShifts, Call);
	});
	it("de-/encodes errors", () => {
		genericJSONTest(testError, Result);
	});
	it("de-/encodes exitmodes", () => {
		genericJSONTest(testFullExitMode, ErdstallObject);
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
	it("de-/encodes receipts", () => {
		genericJSONTest(testTxReceipt, TxReceipt);
	});
	it("de-/encodes clientconfigs", () => {
		genericJSONTest(testClientConfig, Result);
	});
	it("de-/encodes balanceproofs", () => {
		genericJSONTest(testBalanceProofs, ErdstallObject);
	});
	// NOTE: Reenable as soon as Erdstall core is ready.
	// it("de-/encodes attestation reports", () => {
	// 	genericJSONTest(testAttestResponse, ErdstallObject);
	// });
});

function genericJSONTest(data: string, type: any) {
	const res = TypedJSON.parse(data, type);
	expect(JSON.parse(TypedJSON.stringify(res, type))).eql(JSON.parse(data));
}

const testBalanceProofs =
	'{"type":"BalanceProofs","data":{"{\\"type\\":\\"test\\",\\"data\\":\\"0x1fac4fa4d43ca1ee78bc05a94fef98c1249f626ef8442cc918f5b914c34473c9\\"}":{"sig":{"type":"test","data":{"address":"0xa52b5eba7f44d681ed09f96860824a209044d116b22c45166cf5bd25eb56b2b2","msg":"40s5emjjyIew50Beys00MZ1LiZIxX8vcEDEcn8F4W1I="}},"epoch":"18241991556384416545","proofs":{"{\\"type\\":\\"test\\",\\"data\\":\\"0x1fac4fa4d43ca1ee78bc05a94fef98c1249f626ef8442cc918f5b914c34473c9\\"}":{"114":{"exit":[{"funds":{"13279":{"nfts":{"0x89d276415e96d80c5bed37f4021b71d94281a21b823b92a60041b67949b52077":["0x72126eb536ae7e90af7d8796dbe3a5548cac709d962698aaf1c88c85423efd2a"]}},"40294":{"nfts":{"0x461d225111a80c2ddede6ce36e85731223b9a8abcb91e2fafeb19eac20751b61":["0xbb2bcc532fff4aece780ab1e2928cfe861399f373064aed5283513440d73e858"]}},"54807":{"fungibles":{"0x153a2a748e7bd16359cbd8c854b9aac9d2f92e4ed4612ce1ac1b570772782455":"0xe23848368c5d64b068515194ebe1d8ef1a8e35ac80b8f708eb468cccf90416d4"}}},"sig":{"type":"test","data":{"address":"0xf026f8dc75bd9f5a1b678d71beea52d2ac4f1a34615ff802362cde45c3f05865","msg":"gQm74zVEOuZcpNnmGbn5NsKavjDJ7F2O1kcZPscOL4E="}}}],"recovery":[{"funds":{"5791":{"fungibles":{"0xaa86e0a15100b858576400bf79b71bc0fc9c17d841f0e19d46dfdaec653c9d5e":"0xfd136581b0b65d05822337e341ef26e8d1f2c68175f3a44fdf6cc843fc40280c"}},"31740":{"nfts":{"0xcfe8781ff5026ce3816785cc2f15ae858565995184376a3af538ad89df4dbb6e":["0x665531c1eef9b72307c53e54973326afe13ef25264382fccaf5be9139ecba143","0x6fc4b3629893e0182544acbe9d74f190a3fa7255314c824df453cae2c5883cd3"]}},"38663":{"fungibles":{"0x868aa089420c29273bb2a2dd9eddcc1c78c9fbf3667d5f1330a71c5a64845248":"0x7ea58f6296af9e2503b6a56d80d0e5919d8c7442317ac7cf9350cfb09b4bf603"}}},"sig":{"type":"test","data":{"address":"0x3fa4d348855a451db2b4b1b180486bf822bfc26f7b9607c299e30362d8d8f385","msg":"lof5ZotagL/S/1GHfMFPjq3DCvGdg9rTpQ36eHQh0oM="}}}]}}}}}}';

const testClientConfig =
	'{"data":{"type":"ClientConfig","data":{"chains":[{"id":589,"type":"ethereum","data":{"networkID":"143448","contract":"0xf921db5dce197af7d9b3c5a7dfac4530fce1c1de","powDepth":23907239}}]}}}';

const testTxReceipt =
	'{"sig":{"type":"test","data":{"address":"0x506c6423a1108d3a9aa07c5dea5fc604d4a0e9870553161566ccdf594cc7ddfd","msg":"XSoSo0DI7OoI8ZcFlwrZE1kAjewiZt/tgDOTESwpN5U="}},"delta":{"{\\"type\\":\\"test\\",\\"data\\":\\"0x3742f53fbbce5d4b73ec790c0818bbd5c10f4dcc22888ad00879f9e616347c14\\"}":{"nonce":"94692317322499559","values":{"24294":{"fungibles":{"0x207e45ecbfa51447de378518c74acf493de2d225c1c8091cf1e52aeee585ac1a":"0x110636e34fb1c069628179c0354e58c0d6eb9276728531a42a9dc816e4495caf"}},"29051":{"fungibles":{"0x30dd5e0cc616770d0da6492b89d051eff1bea297ee12a82ab71c3d5107ce7372":"0x04763b19a42c5ef7a2940d9cb6ad94d6c120badc69a28134371317db9cefde68"}},"40684":{"fungibles":{"0x60e83fe8b9ff047a8c1239383113a4aed8656a0ceb89c0d75057c24521faaf36":"0x16ab6ed9ed6ee87c46e6df306bed7c53320f519ce2e81914002f3c1aacb8a7cf"}}},"locked":{"23421":{"fungibles":{"0xd5f012e317db41936b5ede67469d572260d756bf1be63653450d39b56b3b4077":"0xfeae51218b8ca7206c856c3ede434956ca010a44b6227d6baaf86456ba0699f9"}},"24213":{"fungibles":{"0xa1737175dc067cba4fde0b587c8e82628414b4d75eb8f4a7ec739d7e684cc56c":"0xf0abfdbbc44db585aa887a5846d5f26b992a9e972b027b6eec58e6e3d3523e32"}},"32231":{"fungibles":{"0xcc6494901917599313eb2936ec2ad45b3e1eb0bfd60c95553d801da0b80e739a":"0x23a8182b6f6b713cf7c37d204f0d98b517c08a7abdded6acb928567be9d45f28"}}}},"{\\"type\\":\\"test\\",\\"data\\":\\"0x683b8d9af165fceb8e8761c4ca32f9b453d89bcb3ec1dc8f1691f3e6b96c5d3e\\"}":{"nonce":"15418449662739961603","values":{"14014":{"nfts":{"0x53a44bb1c44f1ff632a5d2108d9dcbfbd9bdefbb95881f9d5375bbe2becc935d":["0x55bfec59f9f3301f5beebdccc28e16ed88e788299d4cdcecf0c1cb3c3075e449","0xf5820a0be6cc0032ec4a5de5ff044bd89074ad994d2405dbf95afd778651c12c"]}},"35315":{"fungibles":{"0x6378e0a7c6bf812d9aa58a70db365fe2691690486fe033205a82c46ac2a664cd":"0x517f3a19cd40927632ebb6de8d54153fcc79afdb871613b0c88a5bfffd92fbbb"}},"38077":{"nfts":{"0x8790840c64cd0f77c5177ed25c5e9925fed96e33de6ca58500fbe28d3f6beefe":["0x47df25699fd3e2b283dd300cd6e5cb2f2846f24fd7a8afccbc8de527643c85ea","0x6ff1edd978d960ef19e832dbc6562eb6f705082a7d61f45f1cb77c5df0548267","0x71b4ae66fa47687dae996637e5830c2b99ccb1e3b8bf3fee6ce46c2f95775ea9"]}}},"locked":{"22554":{"fungibles":{"0xb0c5af0dcaf38ece7fcfed1c006f6cdd6df6f30cee210db5fdf21c876256bcd2":"0xb9799d67abdeb0fcc9703a216cfaf48772900b405d944f41fb2704b6a08d1f3c"}},"39961":{"nfts":{"0x92654c9c0f12b11c178d6a4996cb56434c879194885244baa00fe28740054946":["0x6ea2d47cc6bd59564e760e36c012eb7ab615ddabbeacd107fe17d6db50a0d284","0xbd95726cb43671bf9774a0ab98bea681f8592c5c0bb6c149e9a0940fa12445e7"]}},"59114":{"fungibles":{"0x295e82725bbc26419808270d766ad61906179ef31d0be7f58a0f1b08ddff7f5f":"0xb6914f46dd5704a96c949984631f922f7bee4d05e5e59166e0f2e690e5694918"}}}},"{\\"type\\":\\"test\\",\\"data\\":\\"0x9ee6ca15ec0f339c428e8cb6a769807daa95ee3dd9e116ca63ab5c9ae2b51937\\"}":{"nonce":"11480719388538901656","values":{"3138":{"fungibles":{"0x51688f8fa78a5bd8c2ae7f522d78044f43bf45b9d71cd91a252fa145d21f5910":"0xa7f1ffe207f203d4646c92b2946734ad137d13cedf240245f28528d25051c386"}},"18701":{"fungibles":{"0xa2fe805c9723664c1b54b0b0d42f0f7c1598bdf2d5bb51e65692a3009b2b057e":"0x50bcdcf16271c24bee8fdc00c6f80fcf31a8ef335ef1b6a03d483eb717af12cf"}},"34356":{"fungibles":{"0x6e217d25d1fd05f33f29bdef44647e28472d4d44192afe370458d9f72a6d61e5":"0x39812e5b7c26a9cdb3d9f7563c3b2371208343a2892483ca929e22f5fac0c9f5"}}},"locked":{"1246":{"nfts":{"0x1ebdd865548576959250f0ad30ca701ed32c420b1aa9c22895594cb8a1ea4c82":["0x32af5e99b4a20a315b4503f88da2643351404df70f085bfd24d03932e29f1743","0xa1492b2ce14a3a14e4589c5c2b78be78e1d1cde80250bf48497f45480687ec62","0xd9a1824d06edabb5eda06cf41206d9810b577ccfb4d02d7b67ddddc5a1dc6386"]}},"1306":{"nfts":{"0x474947f738efb0d83c7fcebd629571b4f89071d273901c901771615f496bfcbb":["0x36cd800e7bd62722106367d8c6db65a417af5f728c37581b9d522b4a0321608b","0xa5c345db5e0a2a2dfdf046fdce7160fbd38d5a67fc29ea8fdac63222aaa37a57","0xe205a544fa2847ffbb5425ed5d01237807b7b75c8531b58279901f6be3f4c77e"]}},"27803":{"fungibles":{"0x0dca119a5d31a4b193918b8cca6120771f916f99605a8036bf37a20c13fdf9d8":"0x88d63e1ccebf17d4914f6e727e9ff200dbadc1c5d82f97086bc449f1c42cb792"}}}}},"output":{"payload":"0x00000000"},"hash":"0x0000000000000000000000000000000000000000000000000000000000000000","tx":{"type":"Transfer","data":{"sig":{"type":"test","data":{"address":"0x682ebde3203aadbbbbbe8af0d1b8f9acd445d009e9eef70c69b1fe1eb9b070eb","msg":"12sBCvghnyA5bWKq7LJY3ipyEtIf4JQtn1rs3OfvFUM="}},"sender":{"type":"test","data":"0xdec7ff515aec82784362ed1b646cfc71cc504c9c97e8234337051f2ef51fbce4"},"nonce":"6167835202947220118","recipient":{"type":"test","data":"0xe04321c15e59a5be2420105664e3639611f44478546cd92f2a37d692265c5a56"},"values":{"27552":{"nfts":{"0xba5e118fb15749a0907ed2aca3c6506ab7aac346d770b47a7e35946d993d88b6":["0xd5ea5de717d320501134192ee733ac1efc80d3cc888e99e14ab058261097a13b"]}},"46321":{"fungibles":{"0x9448ce2d0bfe095e03020cbd3ddb060868d6290b14099cdb2cc94cfc3e6ada06":"0xfb65e750e617b71e5909a94be1343bc5c31c60257cd5005d70f7d01763593f32"}},"62542":{"fungibles":{"0x1c1c2d0b6355b139162c6f5cc5f40e15dbbb77f300aefee9c1e46826172fd7a6":"0x44c994f10c6a857e1ef7de7e6e845a4e543a7554ee4a206035d9bc6ad2d7cfe5"}}}}},"status":0,"error":"EfBICMGl8oeGj4"}';

const testTransfer =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Transfer","data":{"sig":{"type":"test","data":{"address":"0x7a4b047de7a86dcc534bb51605a4fd6f467f9ed4804ef3e52867988c540c36b7","msg":"eMtRaDVZhmtAl7Uw17usZkgMKv5ILjn0cPhCf0sVw6w="}},"sender":{"type":"test","data":"0x6425dfebfbacb8cadb7ae80f4544e42ca783e813273b4a81048ab8188acd4357"},"nonce":"15147042404999956681","recipient":{"type":"test","data":"0x357b8c10e1d1a43f52742f38cc0791c4f56503b57de009224503dcb399e370f9"},"values":{"186":{"fungibles":{"0xebd118f3ab85a314ae04cf59a4e9698d28346ae54c30a84593427ffa0e7297e6":"0x806861498232c4e4914cb567ff3818abf62b371283bbf323b6adb448b2dfd93f"}},"26391":{"fungibles":{"0xdff6be494f95eab908ac97bf6ffea2252971b3e929c276b49a3c2d5afb195165":"0x82c05dc4dc3748df23f218e487c6841781d41ae0a2ba52a370077135b5c49d39"}},"41386":{"nfts":{"0x57ea5725341b29d9a2d37add74a61c9579c97feda1958cc5a3fb4ed6bfe88700":["0x6145366820717fe8f100698f87b356d5474ff2451e4cdb04c27357d0069b7b2f"]}}}}}}}';

const testFullExitMode =
	'{"type":"full","data":{"immediate":false}}';

const testExitRequest =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"ExitRequest","data":{"sig":{"type":"test","data":{"address":"0x6140f6f189947ba96d59b1d74d94babd8767a46ee3dada3b8b3a4d875675b638","msg":"SkXrcJ1WznZMrqjxc1vDBaC0aj2uX/Akb8bK1oCM1XI="}},"sender":{"type":"test","data":"0xb5bd17ec5f4a772fbe3c5b35e496f62f538d126ead2ec57424d93b32edb818e8"},"nonce":"15463012231546595366","override":false,"mode":{"type":"full","data":{"immediate":false}}}}}}';

const testMint =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Mint","data":{"sig":{"type":"test","data":{"address":"0x0c86924f40cd9bccc567e18244b77c7731e11f59281c19b6ae378202f130a901","msg":"RFpxX4/IGxJSDXrwcLeiGBLzHzNEeI7M66Jd0viUg3g="}},"sender":{"type":"test","data":"0x0e42d3cf0e048c4e63f5972999f0770b2b997f443445ba8bb6a8ab8ac5c78ab9"},"nonce":"6123202465099861114","token":"0x02339014234393683008c42a6db05b030b3a96aa52c809c514a2e76d6507b11c","id":"0x01e25d"}}}}';

// Generated in go; do not change, because it is part of a set.
const testTrade =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Trade","data":{"sig":{"type":"test","data":{"address":"0x493baa0503d7724ca29bc84abfd3a294e40033fe6c0049957518bff0871bcc03","msg":"CV6KvriSdZpNFOvWRfiCRVcqAMjFzLoIxnDNNWLodec="}},"sender":{"type":"test","data":"0x0f45298a1ac93d2d510469850f14ce5251d4b2a53095ef37c453bb279d644894"},"nonce":"17029850746887456366","offer":{"sig":{"type":"test","data":{"address":"0x16982c8c6328f9a5ecf753d0d71e52b8e9119850443f5b3ca1c44905d05dc4f2","msg":"2iXLdIF0cpmTpTlzlVDE1WvhuUhFoq5wCqoiKVYmTA8="}},"owner":{"type":"test","data":"0x4299d0d989f8868a01ad5d84a09a80c5cb61e91dbbfd1c6825dc77246f5eca8a"},"offer":{"1028":{"fungibles":{"0x05985d8d68fe2788f71a237232ea3d0084150faaa953cf2a48965fa5f4215a1c":"0xd136c793e6d1be2ae4e6c8295f25ec7069cee069513653f25abd63886d60d8b8"}},"19741":{"fungibles":{"0x957a4a8843c1164e974bb13008166364f1dc77088b72347010ab2cd4ff815d69":"0x5d3d442ca44be8e407e7ef64f7f00d8202986d4ded398f0678265abb11015895"}},"23630":{"nfts":{"0x74e96f6e714002808d4ea55a9c107f0f4fd49b9061b0a2a6ae3e15e6f40e3609":["0x5c27f5ff9250d303e26238e313aa7de2495d2a4378099b779a31e07a9eccabd7","0xf3cc065295c375c04d776e3a7f9879848abbea59323e28583ea15cd8aced6ad7"]}}},"expiry":"238","request":{"31020":{"nfts":{"0xe70ae6fbf7330f21138c63c746e5feca5bfc82bfb8f905da9f91dd8a0f7e797a":["0x5b12a1382ada544bdf9c3b1248973fa6b09c71c8cca6f64094828cc10a57a1bf"]}},"47117":{"fungibles":{"0x6619809f8b41641d95a28ce350e8a6d4752c8af2193a338a80bc78caca5fb153":"0xe2ef15fd020d2d6106766d4a95644f390aa817fdcf53cd9068deca383e0ae45d"}},"48554":{"nfts":{"0xab28225f5050920c266e7e5e2eaf79fc9e80183b5627d3e3263afd6355dbcc16":["0x3b7798f76d737f358b6cd9204494ff9fc927048dc4b9208a6615ce9da8bd54cd","0xe86eac2001c24e7b4c6cf619c1f596103bdb09ca9d96be0c42a1f7947193f614"]}}}}}}}}';

const testError = '{"id":"an-id","error":"could not get proof"}';

const testSubscribeTXs =
	'{"id":"an-id","data":{"type":"SubscribeTXs","data":{"who":{"type":"ethereum","data":"0x8d19897c19cb91aeaea6afc67a7e8c6f35323716"}, "cancel": false}}}';
const testSubscribeBalanceProofs =
	'{"id":"an-id","data":{"type":"SubscribeBalanceProofs","data":{"who":{"type":"ethereum","data":"0x8d19897c19cb91aeaea6afc67a7e8c6f35323716"}}}}';
const testSubscribePhaseShifts =
	'{"id":"an-id","data":{"type":"SubscribePhaseShifts","data":{"cancel": false}}}';