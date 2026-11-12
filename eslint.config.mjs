import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Component files are byte-for-byte copies of spaceship-frontend's
    // src/components/ds and follow that repo's oxlint rules. Lint them there.
    "registry/ui/**",
    "registry/patterns/**",
    "registry/lib/**",
    "public/r/**",
  ]),
]);

export default eslintConfig;
