import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Allow unused vars that start with uppercase (components), underscore prefix, or 'motion' (namespace import)
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^[A-Z_]|^_|^motion$",
          argsIgnorePattern: "^[A-Z_]|^_",
          ignoreRestSiblings: true,
        },
      ],
      // Context files export both Provider components and custom hooks — allow this pattern
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Using setState in useEffect to initialize from localStorage is idiomatic; disable this rule
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
