import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    "node_modules/**",
    ".expo/**",
    "dist/**",
    "build/**",
  ]),
]);

export default eslintConfig;
