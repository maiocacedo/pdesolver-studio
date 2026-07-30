import { defineConfig } from "vitest/config";

// Unit tests run in a plain Node environment — the units under test (payload
// mappers, validation, store reducers) are pure and don't touch the DOM.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
