import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2];
const versionPattern = /^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/;

if (!version || !versionPattern.test(version)) {
  console.error("Usage: npm run update-release -- <version> [installer-path]");
  console.error('Example: npm run update-release -- 1.6.17 "C:\\develop\\Try\\installer\\output\\Shortext-Setup-1.6.17.exe"');
  process.exit(1);
}

const installerName = `Shortext-Setup-${version}.exe`;
const defaultInstaller = join(projectRoot, "..", "installer", "output", installerName);
const sourceInstaller = resolve(process.argv[3] || defaultInstaller);
const downloadsDirectory = join(projectRoot, "public", "downloads");
const destinationInstaller = join(downloadsDirectory, installerName);

await mkdir(downloadsDirectory, { recursive: true });

if (sourceInstaller !== destinationInstaller) {
  try {
    await copyFile(sourceInstaller, destinationInstaller);
  } catch (error) {
    console.error(`Could not copy installer from: ${sourceInstaller}`);
    console.error(error.message);
    process.exit(1);
  }
}

const indexPath = join(projectRoot, "index.html");
const currentHtml = await readFile(indexPath, "utf8");
const updatedHtml = currentHtml
  .replace(/\/downloads\/Shortext-Setup-[^"']+\.exe/g, `/downloads/${installerName}`)
  .replace(/Version \d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?/g, `Version ${version}`);

await writeFile(indexPath, updatedHtml, "utf8");

const readmePath = join(projectRoot, "README.md");
const currentReadme = await readFile(readmePath, "utf8");
const updatedReadme = currentReadme.replace(
  /`public\/downloads\/Shortext-Setup-[^`]+\.exe`/,
  `\`public/downloads/${installerName}\``
);
await writeFile(readmePath, updatedReadme, "utf8");

for (const existingFile of await readdir(downloadsDirectory)) {
  if (/^Shortext-Setup-.+\.exe$/i.test(existingFile) && existingFile !== installerName) {
    await rm(join(downloadsDirectory, existingFile));
  }
}

console.log(`Website release updated to Shortext ${version}.`);
execFileSync(process.execPath, [join(projectRoot, "scripts", "build.mjs")], {
  cwd: projectRoot,
  stdio: "inherit"
});
