// serve.ts
import { serveDir } from "jsr:@std/http@^1.0.0/file-server";

// Simplified version for debugging
const handler = (req) => {
  console.log("Request:", req.url);
  console.log("Request pathname:", new URL(req.url).pathname);
  
  return serveDir(req, {
    fsRoot: "./docs", // Serve files from ./docs
  });
};

console.log("\n🚀 Serving ./docs at http://localhost:8080/\n");
Deno.serve({ port: 8080 }, handler);

