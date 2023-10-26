module.exports = {
  env: {
    browser: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jest/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    // Must come after all other plugins
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
  },
  plugins: ["@typescript-eslint", "import", "react", "react-hooks"],
  rules: {
    "@typescript-eslint/array-type": [
      "error",
      {
        default: "array",
      },
    ],
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/ban-tslint-comment": "error",
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          Boolean: {
            message: "Use 'boolean' instead.",
          },
          Object: {
            message: "Use 'object' or an interface instead.",
          },
          Number: {
            message: "Use 'number' instead.",
          },
          String: {
            message: "Use 'string' instead.",
          },
        },
      },
    ],
    "@typescript-eslint/consistent-indexed-object-style": "error",
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
      },
    ],
    "@typescript-eslint/dot-notation": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
        overrides: {
          accessors: "explicit",
          constructors: "explicit",
        },
      },
    ],
    "@typescript-eslint/member-delimiter-style": "error",
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        // Allow the original names for destructured variables
        selector: ["variable", "function", "parameter"],
        modifiers: ["destructured"],
        format: null,
      },
      {
        selector: "objectLiteralProperty",
        modifiers: ["requiresQuotes"],
        format: null,
      },
      {
        selector: ["variable", "function"],
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
      },
      {
        selector: "enumMember",
        format: ["PascalCase", "UPPER_CASE"],
      },
      {
        selector: ["objectLiteralProperty", "typeProperty"],
        format: ["camelCase", "PascalCase", "snake_case", "UPPER_CASE"],
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: "default",
        format: ["camelCase"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
    ],
    "@typescript-eslint/no-array-constructor": "error",
    "@typescript-eslint/no-base-to-string": "error",
    "@typescript-eslint/no-confusing-void-expression": [
      "error",
      {
        ignoreArrowShorthand: true,
      },
    ],
    "@typescript-eslint/no-dupe-class-members": "error",
    "@typescript-eslint/no-duplicate-imports": "error",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-extraneous-class": "error",
    "@typescript-eslint/no-implied-eval": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/no-invalid-this": "error",
    "@typescript-eslint/no-invalid-void-type": "error",
    "@typescript-eslint/no-loop-func": "error",
    "@typescript-eslint/no-loss-of-precision": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-parameter-properties": "error",
    "@typescript-eslint/no-redeclare": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-throw-literal": "error",
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-unnecessary-type-arguments": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-unnecessary-type-constraint": "error",
    "@typescript-eslint/no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/no-useless-constructor": "error",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-includes": "error",
    "@typescript-eslint/prefer-literal-enum-member": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/quotes": [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],
    "@typescript-eslint/require-array-sort-compare": [
      "error",
      {
        ignoreStringArrays: true,
      },
    ],
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/return-await": "error",
    "@typescript-eslint/triple-slash-reference": [
      "error",
      {
        path: "always",
        types: "prefer-import",
        lib: "always",
      },
    ],
    "@typescript-eslint/type-annotation-spacing": "error",
    "@typescript-eslint/unified-signatures": "error",
    // Causes issues when using React.*, ReactDOM.*
    "import/no-named-as-default-member": "off",
    "react/display-name": "error",
    "react/jsx-boolean-value": ["error", "always"],
    "react/jsx-curly-brace-presence": "error",
    "react/jsx-key": "error",
    "react/jsx-no-bind": [
      "error",
      {
        allowArrowFunctions: true,
      },
    ],
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-target-blank": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-sort-props": "error",
    // Not necessary as of React 17
    // https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "error",
    "react/no-children-prop": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-find-dom-node": "error",
    "react/no-is-mounted": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-unescaped-entities": "error",
    "react/no-unknown-property": "error",
    "react/no-unsafe": "off",
    "react/no-unused-state": "error",
    "react/prop-types": "error",
    // Not necessary as of React 17, conflicts with TS unused import check
    // https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html#eslint
    "react/react-in-jsx-scope": "off",
    "react/require-render-return": "error",
    "react/self-closing-comp": "error",
    // react-hooks/recommended treats this as a warning by default
    "react-hooks/exhaustive-deps": "error",
    // base eslint rules
    "arrow-body-style": ["error", "as-needed"],
    complexity: [
      "error",
      {
        max: 30,
      },
    ],
    "consistent-return": "error",
    "constructor-super": "error",
    curly: "error",
    "eol-last": "error",
    eqeqeq: ["error", "always"],
    "guard-for-in": "error",
    "id-match": "error",
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
          caseInsensitive: false,
        },
        groups: [
          "builtin",
          "external",
          ["internal", "parent"],
          ["sibling", "index"],
        ],
        "newlines-between": "always",
      },
    ],
    "max-lines": "off",
    "new-parens": "error",
    // Use @typescript-eslint/no-array-constructor instead of no-array-constructor
    "no-array-constructor": "off",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-cond-assign": "error",
    "no-console": "error",
    "no-debugger": "error",
    // Use @typescript-eslint/no-dupe-class-members instead of no-dupe-class-members
    "no-dupe-class-members": "off",
    // Use @typescript-eslint/no-duplicate-imports instead of no-duplicate-imports
    "no-duplicate-imports": "off",
    "no-empty": "error",
    // Use @typescript-eslint/no-empty-function instead of no-empty-function
    "no-empty-function": "off",
    // We use the empty pattern as a placeholder variable that doesn't shadow Underscore/Lodash.
    "no-empty-pattern": "off",
    "no-eval": "error",
    "no-fallthrough": "error",
    // Use @typescript-eslint/no-invalid-eval instead of no-implied-eval
    "no-implied-eval": "off",
    // Use @typescript-eslint/no-invalid-this instead of no-invalid-this
    "no-invalid-this": "off",
    "no-irregular-whitespace": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    // Use @typescript-eslint/no-loop-func instead of no-loop-func
    "no-loop-func": "off",
    // Use @typescript-eslint/no-loss-of-precision instead of no-loss-of-precision
    "no-loss-of-precision": "off",
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "no-negated-condition": "error",
    "no-new-wrappers": "error",
    "no-promise-executor-return": "error",
    // Use @typescript-eslint/no-redeclare instead of no-redeclare
    "no-redeclare": "error",
    "no-restricted-globals": [
      "error",
      "event",
      "length",
      "location",
      "name",
      "performance",
      "status",
    ],
    // Use @typescript-eslint/return-await instead of no-return-await
    "no-return-await": "off",
    // Use @typescript-eslint/no-shadow instead of no-shadow
    "no-shadow": "off",
    "no-sparse-arrays": "error",
    "no-template-curly-in-string": "error",
    // Use @typescript-eslint/no-throw-literal instead of no-throw-literal
    "no-throw-literal": "off",
    "no-trailing-spaces": "error",
    // Use the TS compiler for finding undefined vars instead of no-undef
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md
    "no-undef": "off",
    "no-undef-init": "error",
    "no-unsafe-finally": "error",
    // Use @typescript-eslint/no-unused-expressions instead of no-unused-expressions
    "no-unused-expressions": "off",
    // Use @typescript-eslint/no-unused-vars instead of no-unused-vars
    "no-unused-vars": "off",
    // Use @typescript-eslint/no-useless-constructor instead of no-useless-constructor
    "no-useless-constructor": "off",
    "no-useless-concat": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "prefer-const": "error",
    "prefer-regex-literals": "error",
    "prefer-template": "error",
    "quote-props": ["error", "as-needed"],
    // Use @typescript-eslint/quotes instead of quotes
    quotes: "off",
    radix: "error",
    // Use @typescript-eslint/require-await instead of require-await
    "require-await": "off",
    "spaced-comment": [
      "error",
      "always",
      {
        markers: ["/"],
      },
    ],
    // This only sorts member in an individual import statement. We use
    // import/order to actually order the statements themselves.
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
    "sort-keys": ["error", "asc", { natural: true }],
    "use-isnan": "error",
    yoda: "error",
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    react: {
      version: "detect",
    },
  },
};
