"use strict";
import {
	readFileSync,
	writeFileSync,
	copyFileSync,
	existsSync,
	mkdirSync,
} from "fs";
import { walkSync, WalkOptions } from "walk";

const args = process.argv;
if (args.length != 4) {
	console.error(`Please specifiy the base 'package.json' and destination.

  USAGE:
  ${args[1]} <path-to-base-package.json> <destination-publish.package.json>
    `);
	process.exit(1);
}

type FileExtension = ".d.ts" | ".json" | ".ts";

// copyFilesWithExtension copies the declaration files contained in
// `src` into `dest` with their respective subfolder structure.
// e.g.:
//              src/x/y/z.d.ts -> dist/x/y/z.d.ts.
function copyFilesWithExtension(
	src: string,
	dest: string,
	ext: FileExtension[],
) {
	const options: WalkOptions = {
		listeners: {
			file: (base, stats, next) => {
				const matchesExt = ext
					.map((ext) => stats.name.includes(ext))
					.reduce((a, b) => a || b);
				if (!matchesExt) return next();

				const relativeSrc = [base, stats.name].join("/");

				const strippedBase = base.slice(src.length + 1); // +1 => remove leading "/".
				const relativeDestFolder = [dest, strippedBase].join("/");
				const relativeDest = `${relativeDestFolder}/${stats.name}`;

				if (!existsSync(relativeDestFolder))
					mkdirSync(relativeDestFolder);

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

const src = "src";
const dist = "dist";
try {
	copyFilesWithExtension(src, dist, [".d.ts", ".json"]);
} catch (err) {
	console.error(`Unable to copy declaration files: ${err}`);
	process.exit(1);
}
