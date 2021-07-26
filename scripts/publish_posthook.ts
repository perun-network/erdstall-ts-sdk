"use strict";
import { readFileSync, writeFileSync } from "fs";

const args = process.argv;
if (args.length != 4) {
	console.error(`Please specifiy the base 'package.json' and destination.

  USAGE:
  ${args[1]} <path-to-base-package.json> <destination-publish.package.json>
    `);
	process.exit(1);
}

const pathToJSON = args[2];
const publishDestination = args[3];
const basePackageJSON = JSON.parse(readFileSync(pathToJSON).toString());

// Doing explicit whitelisting, so the development `package.json` can get more
// and more fields if necessary without leaking information in the published
// version.
let publishPackageJSON = {
	name: basePackageJSON.name,
	version: basePackageJSON.version,
	description: basePackageJSON.description,
	main: basePackageJSON.main,
	exports: basePackageJSON.exports,
	imports: basePackageJSON.imports,
	repository: basePackageJSON.repository,
	author: basePackageJSON.author,
	contributors: basePackageJSON.contributors,
	license: basePackageJSON.license,
	private: basePackageJSON.private,
	dependencies: basePackageJSON.dependencies,
};

try {
	writeFileSync(
		publishDestination,
		JSON.stringify(publishPackageJSON, null, 2),
	);
} catch (err) {
	console.error(`Unable to write package.json: ${err}`);
	process.exit(1);
}
