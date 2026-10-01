import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
// import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default defineConfig(
  globalIgnores(["dist", "node_modules"]),
  eslint.configs.recommended,
  // tseslint.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  prettierConfig,
);
