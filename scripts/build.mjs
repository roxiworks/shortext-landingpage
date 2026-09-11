import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(projectRoot, "dist");

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

for (const file of ["index.html", "styles.css", "script.js"]) {
  await cp(join(projectRoot, file), join(outputDirectory, file));
}

await cp(join(projectRoot, "public"), outputDirectory, { recursive: true });

console.log(`Shortext website built at ${outputDirectory}`);
