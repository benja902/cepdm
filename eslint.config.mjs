import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // MVP: allow 'any' — type coverage tracked separately
      "@typescript-eslint/no-explicit-any": "off",
      // Intentional HUD-style text nodes ("// MODULE" decorative text)
      "react/jsx-no-comment-textnodes": "off",
      // Unused vars → warn instead of error
      "@typescript-eslint/no-unused-vars": "warn",
      // prefer-const → already best practice but keep as warn
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
