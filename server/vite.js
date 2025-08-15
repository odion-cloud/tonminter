import fs from "fs";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

export function log(message, source = "express") {
  const time = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${time} [${source}] ${message}`);
}

export async function setupVite(app, server) {
  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
  }
}

export function serveStatic(app) {
  const distPath = path.resolve("client/build");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}.\n` +
      `Please run "npm run build" to create the build directory.`
    );
  }

  app.use(express.static(distPath));
  
  app.get("*", (_req, res) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("File not found");
    }
  });
} 