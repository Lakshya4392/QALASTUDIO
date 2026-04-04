import globals from "globals";
import pluginHooks from "@eslint/eslint-plugin-hooks";
import pluginJsxA11y from "@eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "import": tseslint.plugin,
      "jsx-a11y": pluginJsxA11y,
      hooks: pluginHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/ban-types": [
        "error",
        {
          types: {
            "{}": false,
            object: {
              message:
                "Use `Record<string, unknown>` instead if you really mean any object.",
            },
          },
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-duplicate-enum-values": "error",
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-extra-semi": "error",
      "@typescript-eslint/no-inferrable-types": [
        "error",
        {
          ignoreParameters: true,
        },
      ],
      "@typescript-eslint/no-loss-of-precision": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-redeclare": "error",
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-declaration-merging": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/prefer-enum-initializers": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-literal-enum-member": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-readonly-parameter-types": "error",
      "@typescript-eslint/prefer-reduce-component-return-value": "warn",
      "@typescript-eslint/prefer-regexp-exec": "error",
      "@typescript-eslint/prefer-return-this-type": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "@typescript-eslint/require-array-sort-compare": [
        "error",
        {
          message:
            "Expected an Array.prototype.sort compare function argument.",
        },
      ],
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/restrict-template-expressions": "error",
      "@typescript-eslint/sort-type-union-intersection-members": "error",
      "@typescript-eslint/type-annotation-spacing": "error",
      "arrow-body-style": ["error", "as-needed"],
      "complexity": ["warn", 15],
      "curly": ["error", "all"],
      "dot-notation": ["error", { "allowKeywords": true }],
      "eqeqeq": ["error", "smart"],
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-anonymous-default-export": "error",
      "import/no-deprecated": "warn",
      "import/no-named-as-default-member": "error",
      "import/no-unused-modules": [
        "error",
        {
          "unusedExports": true,
          "missingExports": true,
        },
      ],
      "max-lines": ["warn", 300],
      "max-lines-per-function": ["warn", 50],
      "max-nested-callbacks": ["error", 3],
      "max-params": ["warn", 5],
      "no-alert": "error",
      "no-case-declarations": "error",
      "no-console": "off",
      "no-continue": "error",
      "no-debugger": "error",
      "no-empty": "error",
      "no-eval": "error",
      "no-extra-bind": "error",
      "no-implied-eval": "error",
      "no-invalid-this": "error",
      "no-lone-blocks": "error",
      "no-magic-numbers": [
        "warn",
        {
          "ignore": [0, 1, -1, 2, -2, 3, -3, 100],
          "ignoreArrayIndexes": true,
        },
      ],
      "no-new-func": "error",
      "no-return-assign": ["error", "except-parens"],
      "no-self-compare": "error",
      "no-throw-literal": "error",
      "no-unmodified-loop-condition": "error",
      "no-unused-labels": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "one-var": ["error", "never"],
      "prefer-const": "error",
      "radix": "error",
      "require-atomic-updates": "error",
      "require-await": "error",
      "vars-on-top": "error",
      "wrap-iife": ["error", "any"],
    },
    overrides: [
      {
        files: ["**/__tests__/**", "**/?(*.)+(spec|test).ts"],
        rules: {
          "import/no-unused-modules": "off",
          "max-lines": "off",
          "max-lines-per-function": "off",
          "max-nested-callbacks": "off",
          "max-params": "off",
        },
      },
    ],
  },
);
