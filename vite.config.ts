import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    tsconfigPaths(),
    tailwindcss(),
    react({
      babel: {
        plugins: [["@babel/plugin-proposal-decorators", { version: "2023-11" }]],
      },
    }),
  ],
  server: {
    middlewareMode: false,
  },
  build: {
    target: "ES2022",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
});
