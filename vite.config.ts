import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this.
      server: { entry: "./src/server.ts" },
    }),
    // React's Vite plugin must come after Start's Vite plugin.
    viteReact(),
    tailwindcss(),
    // Build-only. No hardcoded preset — Nitro auto-detects the deployment
    // target (Vercel, Cloudflare, Netlify, etc.) from the build environment.
    // Override with the NITRO_PRESET env var if a specific target ever needs
    // to be forced (e.g. `NITRO_PRESET=cloudflare_module vite build`).
    nitro(),
  ],
});
