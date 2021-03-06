"use strict";
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";
import { walkSync, WalkOptions } from "walk";

const args = process.argv;
if (args.length != 4) {
	console.error(`Please specifiy the base 'package.json' and destination.

  USAGE:
  ${args[1]} <path-to-base-package.json> <destination-publish.package.json>
    `);
	process.exit(1);
}

// copyDeclarationFiles copies the declaration files contained in
// `src` into `dest` with their respective subfolder structure.
// e.g.:
//              src/x/y/z.d.ts -> dist/x/y/z.d.ts.
function copyDeclarationFiles(src: string, dest: string) {
	const options: WalkOptions = {
		listeners: {
			file: (base, stats, next) => {
				if (!stats.name.includes(".d.ts")) return next();
				const relativeSrc = [base, stats.name].join("/");

				const strippedBase = base.slice(src.length + 1); // +1 => remove leading "/".
				const relativeDest = [dest, strippedBase, stats.name].join("/");
				copyFileSync(relativeSrc, relativeDest);

				next();
			},
		},
	};
	walkSync(src, options);
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
	keywords: basePackageJSON.keywords,
	author: basePackageJSON.author,
	contributors: basePackageJSON.contributors,
	license: basePackageJSON.license,
	bugs: basePackageJSON.bugs,
	homepage: basePackageJSON.homepage,
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

const src = "src";
const dist = "dist";
const README = "README.md";
try {
	copyDeclarationFiles(src, dist);
	copyFileSync(`${README}`, join(dist, README));
} catch (err) {
	console.error(`Unable to copy declaration files: ${err}`);
	process.exit(1);
}
