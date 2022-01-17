import { Address } from "#erdstall/ledger";

export const NODE_PORT = 1362;
export const NODE_ENDPOINT = `http://localhost:${NODE_PORT}`;
export const OP_PORT = 1433;
export const OP_ENDPOINT = new URL(`ws://127.0.0.1:${OP_PORT}/ws`);
export const PERUN_ADDR = Address.fromString(
	"0x079557d7549d7D44F4b00b51d2C532674129ed51",
);
export const PART_ADDR = Address.fromString(
	"0x923439be515b6A928cB9650d70000a9044e49E85",
);
export const MNEMONIC =
	"pistol kiwi shrug future ozone ostrich match remove crucial oblige cream critic";
