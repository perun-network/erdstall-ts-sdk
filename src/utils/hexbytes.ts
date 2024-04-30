export function parseHex(str: string, prefix?: "0x" | ""): Uint8Array {
	if(str.length == 0) return new Uint8Array();
	if((prefix ?? "0x" === "0x") && str.startsWith("0x")) str = str.slice(2);
	if(str.length & 1) throw new Error("Uneven hex string!");

	const digits = new Uint8Array(Array.from(str).map(c => {
		const parsed = parseInt(c, 16);
		if(Number.isNaN(parsed)) throw new Error(`Invalid hex number (${str}, (prefix ${JSON.stringify(prefix)}))`);
		return parsed;
	}));

	return new Uint8Array(digits.length >> 1).map(
		(_, i) => (digits[2*i] << 4) | digits[2*i+1]);
}

export function toHex(bytes: Uint8Array, prefix?: "0x" | ""): string {
	if(bytes.length == 0) return "";
	return bytes.reduce(
		(hex, b) => hex + Number(b).toString(16).padStart(2, '0'),
		"" + (prefix ?? "0x"));
}