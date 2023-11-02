// SPDX-License-Identifier: Apache-2.0
"use strict";

import { describe, it } from "mocha";
import { expect } from "chai";
import { ChainAssets } from "./assets";

describe("Assets", () => {
	it("can be de- & encoded from & to JSON", () => {
		const v = ChainAssets.fromJSON(JSON.parse(testValues));
		expect(v).eql(ChainAssets.fromJSON(ChainAssets.toJSON(v)));
		expect(ChainAssets.toJSON(v)).eql(JSON.parse(testValues));
	});
});

const testValues =
	'{"10835":{"nfts":{"409859ebc73540b6726357f3c6da0360b645f9cb7fa173a3b1d14825603683e5":["0x596be7d2221c14c9b3bd4c2fc74bcb77896dfc6fac86bfe2cda553ddb095e10f","0xe7a079eb3133a03c385a57d6f8643e55bcf2a18da8c53bf8e058cc00335e1a0e","0xf7c1257221bec37a1fadb7a38f948ed7c3eca5275dc1ff861ad618c0d8d3aed6"]}},"3423":{"nfts":{"73d694150a16a3e885af7169f0c469aef3a1dea19c3490c7dcfcdb6ed6035a29":["0xdd2587d4d1bf9da1f7a05fb715fb351457a3124734327f063a5c6af166ca31d9"]}},"8471":{"nfts":{"8fca8c5651887ecebc795597ee4276e19c20b800a53a0b26e5539b61e6347972":["0x7de1f031eb2af2f36471dd4de0d9c5843490fef395c51c1ca321d7c0076c21fd","0xd60f6490dc12d4273e5d52da1dcf85519e6d3ba2443e8889fe5e58f141568f53","0xeb524843de1c7a5a708823431fc60df4ec4479a6f8b35fca68c598a9ffea5f92"]}}}';
