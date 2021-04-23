"use strict";

export default class Address
{
	private bytes: Uint8Array = new Uint8Array(20);

	constructor(str: string)
	{
		if(!str.match(/^(0[xX])?[0-9a-fA-F]{40}$/))
			throw new Error("expected 20-byte hex string");

		str = str.slice(-40);
		for(let i = 0; i < 20; i++)
			this.bytes[i] = Number.parseInt(str.slice(2*i, 2*i+2), 16);
	}

	public toString(prefix: boolean = true): string
	{
		return (prefix ? "0x" : "")
			+ Array.from(this.bytes).map(
				x => x.toString(16).padStart(2, "0")
			).join();
	}
}