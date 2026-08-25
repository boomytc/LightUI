import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  cacheDir: path.join(root, ".cache/vite"),
  resolve: {
    alias: {
      "@": path.join(root, "src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5203,
    strictPort: true,
    fs: { allow: [root, path.resolve(root, "../..")] },
  },
  preview: {
    host: "127.0.0.1",
    port: 4203,
    strictPort: true,
  },
  build: {
    outDir: path.join(root, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    reportCompressedSize: false,
  },
});
