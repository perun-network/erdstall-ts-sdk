import { helloworld } from "./index";
import { expect } from "chai";

describe("index", () => {
	it("return helloworld", () => {
		expect(helloworld()).to.equal("helloworld");
	});
});
