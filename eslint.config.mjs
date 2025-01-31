import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";

// Default import for @babel/eslint-parser (Fixing the named import issue)
import pkg from "@babel/eslint-parser";
const { ESLintParser: BabelParser } = pkg;

// Default import for @typescript-eslint/parser (Fixing the named export issue)
import pkgTs from "@typescript-eslint/parser";
const { ESLintParser: TypeScriptParser } = pkgTs;

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: cleanGlobals(globals.browser),
      parser: TypeScriptParser,  // Use the TypeScript parser object
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,tsx}"],
    languageOptions: {
      globals: cleanGlobals(globals.browser),
      parser: BabelParser,  // Use the Babel parser object
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  pluginJs.configs.recommended,
  ...(Array.isArray(tseslint.configs?.recommended) ? tseslint.configs.recommended : []),
  ...(Array.isArray(pluginReact.configs?.recommended) ? pluginReact.configs.recommended : []),
  {
    rules: {
      "no-unused-vars": ["error", { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }],
    },
  },
];

// Helper function to clean up global variables by trimming leading/trailing whitespace
function cleanGlobals(globalsObj) {
  const cleaned = {};
  for (const key in globalsObj) {
    if (Object.prototype.hasOwnProperty.call(globalsObj, key)) {
      cleaned[key.trim()] = globalsObj[key];
    }
  }
  return cleaned;
}
