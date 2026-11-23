import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(root, "../..");
const faviconPath = path.join(workspace, "design/favicon.svg");

function designFaviconPlugin(): Plugin {
  return {
    name: "lightui-design-favicon",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname !== "/favicon.svg") {
          next();
          return;
        }
        res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
        res.end(fs.readFileSync(faviconPath));
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "favicon.svg",
        source: fs.readFileSync(faviconPath),
      });
    },
  };
}

export default defineConfig({
  root,
  plugins: [react(), tailwindcss(), designFaviconPlugin()],
  cacheDir: path.join(root, ".cache/vite"),
  resolve: {
    alias: {
      "@": path.join(root, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    fs: { allow: [workspace] },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: path.join(root, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    reportCompressedSize: false,
  },
});
