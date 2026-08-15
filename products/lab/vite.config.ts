import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(root, "../..");

export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
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
