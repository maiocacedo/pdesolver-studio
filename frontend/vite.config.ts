import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // important for the file:// load when packaged with PyInstaller
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    // The only chunk above the default 500 kB warning is the lazy Three.js
    // surface, which is intentionally deferred and never in the initial load.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // KaTeX is needed for the sidebar LaTeX at first paint, so it can't be
          // deferred — but splitting it into its own chunk keeps it out of the
          // main bundle and lets it load in parallel / cache independently.
          // (Three.js is split automatically via the dynamic import in VizPanel.)
          katex: ["katex"],
        },
      },
    },
  },
});
