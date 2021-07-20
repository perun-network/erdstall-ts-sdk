// SPDX-License-Identifier: Apache-2.0
"use strict";

import { describe, it } from "mocha";
import { expect } from "chai";
import { Assets } from "#erdstall/ledger/assets";

const testAssets =
	'{"0xB4e926e46f78aC029A7FEAaEa6454bd598C71ebD":{"uint":"0x2a2f2b362926c8bb3f3d389683e62786d1816ff11515f71956f665da5d6d07d6"},"0x977881a030D6F500f8b07bCA0a55692871d79ec6":{"uint":"0xd67472c0eda44c7c373d009df0a7a63ba667a631d08eb2ddb7708a0d0160f8d2"},"0xCA63670a0DDeCD683A9a17fa35b141A28031CA00":{"uint":"0xdf20998692eb7b9cb14c868b826101fc6ad23c5b90533d8253cd728d51c8ebe1"},"0x6859f1c63Ff99A2C47d619fed876A5b1B91027DE":{"uint":"0x85bfae9c912f2fcf514ddd277ee256b4038e7e24308b18079255e114cae8f35e"},"0xDd61243d61AfCdA47284dc9E19d419BFf5b3d5aE":{"idset":["0x112acf075909e3bfdcf13b650f8d1105f98f10a032a2b608b7414fe4021a25ea","0xa3dc25591da1935d0da50905de2280044b35766ad5750a498d9caca68c9c2649","0xadca4f5e845bba8ab4ee3b602750da863f1adaade0459e9154659d032ac31ff0","0xb6b01559bb2e0ada11116696f46f083b537cfc09e058bfcdd3295f4aed168dc1","0xb74a7e442d93ead0d03c41b3bcbffcba8dbd6e2f03d17b842354e688901d2abd","0xc147ffa36790d1c68b524bd7fc8485920591365d729668f4fab571d09ad121e2","0xc4a152a74eaca29844cee6dafac548abc4d5a813d79c84ea3f4304d43fc5e6f1","0xeefbdef464a95ed465c231f88f856efb0a1bc261ef32c861822aa5944140f615","0xf6dc3b4c7b5634a79be21c1b3226ce5704fdbef5c1ff07606a33c6210a5c560b","0xfcb6d47b315e3c4e4afef17f47d9d2aef730c30777c411ee26e94885f5019e11"]},"0x37148511AFA1143fA810Ae860dB29790D0466014":{"idset":["0x1f291ac618b51151a3820d4dac7c828c5886d6b4c8461d461858d480a3d3c228","0xfc1e9d5252160f88334ae0e77174382db8c3a08e743caad211ba2af7c87e842a"]}}';

describe("Assets", () => {
	it("can be de- & encoded from & to JSON", () => {
		const vs = Assets.fromJSON(JSON.parse(testAssets));
		expect(vs).eql(Assets.fromJSON(Assets.toJSON(vs)));
		expect(Assets.toJSON(vs)).eql(JSON.parse(testAssets));
	});
});
