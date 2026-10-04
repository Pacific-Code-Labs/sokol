import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { existsSync, readFileSync } from "node:fs";

export default defineConfig(() => ({
  base: "/",
  server: {
    host: "127.0.0.1",
    port: 5173, // landing 5173 · app 5174 · admin 5175 (root reboot-server.sh)
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  // Public marketing site only: the app (sokol-app) and the admin console
  // (sokol-admin) are separate apps; no admin or auth code ships here.
  plugins: [react(), {
    name: "localized-preview-shells",
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = (request.url ?? "").split("?")[0];
        if (!/^\/(?:es|en)(?:\/[a-z-]+)*\/?$/.test(pathname)) return next();
        const file = path.join(__dirname, "dist", pathname, "index.html");
        if (!existsSync(file)) return next();
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(readFileSync(file));
      });
    },
  }],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
