// SPDX-License-Identifier: Apache-2.0
"use strict";

import "reflect-metadata";
import { describe, it } from "mocha";
import "../..";
import { TypedJSON } from "typedjson";
import { Call, Result } from "..";
import { expect } from "chai";
import { Balance, BalanceProof } from "../responses/balanceproof";
import { Assets } from "../../ledger/assets";
import { Address } from "../../ledger/address";
import { Signature } from "../signature";
import { ClientConfig } from "../responses/clientconfig";

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
	it("de-/encodes receipts", () => {
		genericJSONTest(testTxReceipt, Result);
	});
	it("de-/encodes clientconfigs", () => {
		genericJSONTest(testClientConfig, Result);
	});
	it("de-/encodes balanceproofs", () => {
		genericJSONTest(testBalanceProofResult, Result);
	});
});

function genericJSONTest(data: string, type: any) {
	const res = TypedJSON.parse(data, type);
	expect(JSON.parse(TypedJSON.stringify(res, type))).eql(JSON.parse(data));
}

const testBalanceProofResult =
	'{"data":{"type":"BalanceProof","data":{"balance":{"epoch":"2","account":"0x98301285f9ebaf0f91b6bd623d564218c2363ceb","values":{"0x079557d7549d7D44F4b00b51d2C532674129ed51":{"uint":"0x3635c9adc5dea00000"}},"exit":false},"sig":"0x1df39f511438459ff46b68316eec3191c3b53444615a827fa97840d36d6e420b539488a9eee3d54648ff2fc62fe3d0f89a2fb3dd1df3e975f2c3cbc75bc166291b"}}}';

const testClientConfig =
	'{"data":{"type":"ClientConfig","data":{"networkID":"0x23058","contract":"0x75a96a43b52366e05c9b1d5c7ca01aa69f373553","powDepth":23907239}}}';

const testTxReceipt =
	'{"data":{"type":"TxReceipt","data":{"tx":{"type":"Transfer","data":{"sig":"0xa6b8584f39c1bb23ce03827e5cae30114644c366a6f8fa7e464ebca80876a3274fef1afe03d80bb98d21d58e1acf92aa3aa02379355d0c81e93fe31698b24647bd","nonce":"4272861793665600370","sender":"0x3dae4441eaeea77abe337d13b50487205145f3d2","recipient":"0x825e7acaefe9158ce8456203eab45d0fd2e1af1e","values":{"0x455498D5602567d0c3260b5F5381Bfb78656f4Bc":{"idset":["0xee62c50552814a6281e97c96229475523b9d5e635f5c2781e9f8863b607f2f4a"]},"0x732F36D2e8B0C49d0c1F76Dab1Fa71E7De029Bf4":{"uint":"0xba139d5cb39c33b042412d3c038d33c35d44a0bf02d8fbfbe97b6f8c1dcc27d0"},"0x3A18a4e6EF6e780f85C501E3edF96ADC9F1eD4a8":{"idset":["0x30a1aef871e1d4831f15e06760e5cb6654904691bfcd56b4b6012aea1c185dfc","0x9f174ed2ac5cae3af1b202689f295dd46ab8c12057f3142f00bbac37d2f4255b","0xd7cba7b6d048de46b09de69b6d9dbf685b2a1918be50608a199095b14fad396a"]}}}},"account":{"nonce":"1778407585292477669","values":{"0x7f3072cfbAbb02A6FeF67D124D977D4eC71D8435":{"idset":["0x476dc77a1af8ca374d09240305eeaa856a3e54bb1c24c2a27312a132b1153013","0xf6e3561549e6d2a1c469883a02daf73b4284ab8233b8f4c0b6497c79453f84b0"]},"0x7D19874796e76b0F5a3B5dcDC0c0eddBE491c972":{"uint":"0xee400e9a5a67913b3f19379b2fe53b8cda76196f25ab40a4bc5b7cd9873261ef"},"0xaaA6AeA2EE1aBfFF3eD6106699DaD11CB5573334":{"idset":["0x34b37b5d4b4dd782303bb5a05d3e16cdc3f2717cf4ceae8c6af44dfec9bf1dec","0x71af4acca7dd61014f74208f61645c44cafbd12a2385ea8bdd3123ed5efa610b"]}},"locked":{"0x9430490E2a9ed89A09a1B87e0F77979f895f0CE1":{"idset":["0x231243292fa026d6b290d6d9e5bd4fbbff8b74f12c9c0afe646a99dd6ba8e2e1","0x9b4ce56c90f553971def194605386506befd469b1d1c3ab86732dc0e3b663d64","0xf33ab366cc92f61bef0ec5215df31a34f14b69a660a32a8eb58212a6b185bf56"]},"0x8e53A74656780616EE70cA396423eB4384A862fd":{"idset":["0x8726a611c93ffc1a0bcab6f1be9b38542ce9214b8d10b7ad82be918cd39bb454"]},"0xf35bb68687A12874aB19217379e35B7218F139b0":{"idset":["0x7282a34a48f47b161998d85b93e4eb7b9af40670bcdcd225df371014b4687ddd","0x952918b2af1215de4a512914f98a08badca482df8ade59088d1c6216b416c375"]}}}}}}';

const testTransfer =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Transfer","data":{"sig":"0x4702a782ed2cec2d0f6a3033b0b5cc4628da33cabf84c4c61d50ed2676eb00dd5f8738c56c1c4bb9b0372b0ac934ceff9963afc509534bef5410c67e04d946e5f6","nonce":"216021471606088551","sender":"0xaac91eb099bfedca2bb0c7c0242dd1a6533a8bad","recipient":"0x8121a1e0f4eec3ae4006699df217695e94a9bc50","values":{"0xBCA5e7a4BCd379Ed0A508658185804607d3e660C":{"uint":"0x1de2b278042605c0af89c122064c942730ff97a82d2a0c1bd5506818d2341241"},"0x668916e2947cb3430f586Bd2C560a47cF8235c92":{"uint":"0xdb0e3b634d3c871dc7158488d50e25e860fc6daba25f39c917ed5993b32e3469"},"0x37C5Dfc28c5A448dDc2868a64aaD17362a6d0088":{"uint":"0x81987ded1cd1e4e1f6de6bdfa410c9815115d8cf3e131e3b010978c400a2edd5"}}}}}}';

const testExitRequest =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"ExitRequest","data":{"sig":"0x525612193533644d30fe57e6e8e1979319b3e6eae975ed2df3252c43c3ae721476cbf9d74aef61c1294704cc00a7ec36aa6e2181127831f57d6f0518e0c459b7c0","nonce":"1863693455832366668","sender":"0x972cb3cc31ba2b845a52c6abaefcd5f09f7ba678"}}}}';

const testMint =
	'{"id":"an-id","data":{"type":"Transaction","data":{"type":"Mint","data":{"sig":"0x567f6956646dbc537ac6239f87e78416149ad102abf78f093a373ff6a283284f93853af25d07327b9135c6499c1c28fd6082be0563ddd559ac554d4a78eff61bad","nonce":"3424314417749617446","sender":"0x1be64a84d68c5cb92640eb7f64336fe5e180b676","token":"0x3c85ef52db875ca7a3ccaaedcc6fc86a25621b90","id":"123485"}}}}';

const testError = '{"id":"an-id","error":"could not get proof"}';

const testSubscribeTXs =
	'{"id":"an-id","data":{"type":"SubscribeTXs","data":{"who":"0x92aaff3bba15f99960d54074ed2464c337fee0ab", "cancel": false}}}';
const testSubscribeBalanceProofs =
	'{"id":"an-id","data":{"type":"SubscribeBalanceProofs","data":{"who":"0x92aaff3bba15f99960d54074ed2464c337fee0ab", "cancel": false}}}';
