import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	globalIgnores(["src/ledger/backend/ethereum/contracts/**"]),
	{
		extends: compat.extends("eslint:recommended", "prettier"),

		plugins: {
			"@typescript-eslint": typescriptEslint,
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.commonjs,
				BigInt: true,
			},

			parser: tsParser,
		},

		rules: {
			strict: 0,
			"linebreak-style": 0,

			quotes: [
				"error",
				"double",
				{
					avoidEscape: true,
				},
			],

			semi: 1,
			"no-cond-assign": 0,
			"no-constant-condition": 1,
			"no-duplicate-case": 1,
			"no-empty": 1,
			"no-ex-assign": 1,
			"no-extra-boolean-cast": 1,
			"no-extra-semi": 1,
			"no-fallthrough": 1,
			"no-func-assign": 1,
			"no-global-assign": 1,
			"no-implicit-globals": 2,
			"no-inner-declarations": ["error", "functions"],
			"no-irregular-whitespace": 2,
			"no-loop-func": 1,
			"no-multi-str": 1,
			"no-mixed-spaces-and-tabs": 1,
			"no-tabs": 0,
			"no-proto": 1,
			"no-sequences": 1,
			"no-throw-literal": 1,
			"no-unmodified-loop-condition": 1,
			"no-useless-call": 1,
			"no-void": 1,
			"no-with": 2,
			"wrap-iife": 1,
			"no-redeclare": 1,

			"no-unused-vars": [
				"warn",
				{
					vars: "all",
					args: "none",
				},
			],

			"no-sparse-arrays": 1,
		},
	},
]);
