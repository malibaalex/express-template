import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts",
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/generated/**",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          clearMocks: true,
          restoreMocks: true,
        },
      },
      //   {
      //     extends: true,
      //     test: {
      //       name: "integration",
      //       include: ["tests/integration/**/*.test.ts"],
      //       setupFiles: ["tests/setup/integration.ts"],
      //       fileParallelism: false,
      //       testTimeout: 30_000,
      //       hookTimeout: 30_000,
      //     },
      //   },
    ],
  },
});
