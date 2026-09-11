import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { basename, dirname, extname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const requestedRoot = process.argv[2] || ".";
const servingRoot = resolve(projectRoot, requestedRoot);
const publicRoot = join(projectRoot, "public");
const preferredPort = Number(process.env.PORT || 4173);
const maxPortAttempts = 20;
let activePort = preferredPort;
let portAttempts = 0;
const types = {
  ".css": "text/css; charset=utf-8",
  ".exe": "application/vnd.microsoft.portable-executable",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".ttf": "font/ttf"
};

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const candidateRoots = servingRoot === projectRoot ? [servingRoot, publicRoot] : [servingRoot];
  let filePath;

  for (const root of candidateRoots) {
    const candidate = normalize(join(root, relativePath));
    const pathFromRoot = relative(root, candidate);
    const isInsideRoot = !isAbsolute(pathFromRoot) && pathFromRoot !== ".." && !pathFromRoot.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`);

    if (isInsideRoot && existsSync(candidate)) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  if (statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
  const fileStats = statSync(filePath);
  const extension = extname(filePath).toLowerCase();
  const headers = {
    "Content-Length": fileStats.size,
    "Content-Type": types[extension] || "application/octet-stream"
  };

  if (extension === ".exe") {
    headers["Content-Disposition"] = `attachment; filename="${basename(filePath)}"`;
  }

  response.writeHead(200, headers);
  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && portAttempts < maxPortAttempts) {
    const unavailablePort = activePort;
    activePort += 1;
    portAttempts += 1;
    console.warn(`Port ${unavailablePort} is already in use. Trying ${activePort}...`);
    server.listen(activePort, "127.0.0.1");
    return;
  }

  throw error;
});

server.on("listening", () => {
  console.log(`Shortext website available at http://127.0.0.1:${activePort}`);
});

server.listen(activePort, "127.0.0.1");
