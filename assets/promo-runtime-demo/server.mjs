import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png"
};

const server = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const requested = normalize(join(root, pathname));

  if (!requested.startsWith(root) || !existsSync(requested)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": mime[extname(requested)] || "application/octet-stream",
    "cache-control": "no-store"
  });
  createReadStream(requested).pipe(response);
});

server.listen(41739, "127.0.0.1", () => {
  console.log("promo-demo-server http://127.0.0.1:41739");
});
