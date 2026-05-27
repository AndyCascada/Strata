import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      reporter: ["text", "html"],
      include: ["lib/**", "app/api/**", "packages/shared/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@strata/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
});
