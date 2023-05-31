/*
//  .eslintrc.js
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

const { resolve } = require('path');
module.exports = {
    // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
    // This option interrupts the configuration hierarchy at this file
    // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
    root: true,

    // https://eslint.vuejs.org/user-guide/#how-to-use-custom-parser
    // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
    // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
    parserOptions: {
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
        // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
        // Needed to make the parser take into account 'vue' files
        extraFileExtensions: ['.vue'],
        parser: '@typescript-eslint/parser',
        project: resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module' // Allows for the use of imports
    },

    env: {
        browser: true,
        node: true
    },

    // Rules order is important, please avoid shuffling them
    extends: [
        // Base ESLint recommended rules
        'eslint:recommended',

        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
        // ESLint typescript rules
        'plugin:@typescript-eslint/recommended',
        // consider disabling this class of rules if linting takes too long
        'plugin:@typescript-eslint/recommended-requiring-type-checking',

        // Uncomment any of the lines below to choose desired strictness,
        // but leave only one uncommented!
        // See https://eslint.vuejs.org/rules/#available-rules
        'plugin:vue/vue3-essential', // Priority A: Essential (Error Prevention)
        // 'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
        // 'plugin:vue/vue3-recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)
    ],

    settings: {
    },

    plugins: [
        // required to apply rules which need type information
        '@typescript-eslint',

        // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
        // required to lint *.vue files
        'vue',

        // https://github.com/typescript-eslint/typescript-eslint/issues/389#issuecomment-509292674
        // Prettier has not been included as plugin to avoid performance impact
        // add it as an extension for your IDE
    ],

    globals: {
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        __statics: 'readonly',
        __QUASAR_SSR__: 'readonly',
        __QUASAR_SSR_SERVER__: 'readonly',
        __QUASAR_SSR_CLIENT__: 'readonly',
        __QUASAR_SSR_PWA__: 'readonly',
        process: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly'
    },

    // add your custom rules here
    rules: {

        // TypeScript
        // quotes: ['warn', 'single', { avoidEscape: true }],
        // '@typescript-eslint/explicit-function-return-type': 'off',
        // '@typescript-eslint/explicit-module-boundary-types': 'off',

        // allow debugger during development only
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

        // typescript-eslint 4.28.3
        // TODO: Review rules.
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
        "brace-style": "off",
        "@typescript-eslint/brace-style": ["error"],
        "comma-dangle": "off",
        "@typescript-eslint/comma-dangle": ["error", "never"],
        "comma-spacing": "off",
        "@typescript-eslint/comma-spacing": ["error"],
        "default-param-last": "off",
        "@typescript-eslint/default-param-last": ["error"],
        "dot-notation": "off",
        "@typescript-eslint/dot-notation": ["error", { "allowKeywords": true }],
        "func-call-spacing": "off",
        "@typescript-eslint/func-call-spacing": ["error", "never"],
        "indent": "off",
        // Warning: https://github.com/typescript-eslint/typescript-eslint/issues/1824
        "@typescript-eslint/indent": ["error", 4, { "SwitchCase": 1, "outerIIFEBody": 1 }],
        "init-declarations": "off",
        "@typescript-eslint/init-declarations": ["error", "always"],
        "keyword-spacing": "off",
        "@typescript-eslint/keyword-spacing": ["error"],
        "lines-between-class-members": "off",
        "@typescript-eslint/lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
        "no-array-constructor": "off",
        "@typescript-eslint/no-array-constructor": ["error"],
        "no-dupe-class-members": "off",
        "@typescript-eslint/no-dupe-class-members": ["error"],
        "no-duplicate-imports": "off",
        "@typescript-eslint/no-duplicate-imports": ["error"],
        "no-empty-function": "off",
        "@typescript-eslint/no-empty-function": ["error"],
        "no-extra-parens": "off",
        "@typescript-eslint/no-extra-parens": ["error"],
        "no-extra-semi": "off",
        "@typescript-eslint/no-extra-semi": ["error"],
        "no-implied-eval": "off",
        "@typescript-eslint/no-implied-eval": ["error"],
        "no-invalid-this": "off",
        "@typescript-eslint/no-invalid-this": ["error"],
        "no-loop-func": "off",
        "@typescript-eslint/no-loop-func": ["error"],
        "no-loss-of-precision": "off",
        "@typescript-eslint/no-loss-of-precision": ["error"],
        "no-magic-numbers": "off",
        "@typescript-eslint/no-magic-numbers": [
            "error",
            {
                "ignore": [-1, 0, 1, 2],
                "ignoreEnums": true,
                "ignoreNumericLiteralTypes": true,
                "ignoreReadonlyClassProperties": true
            }
        ],
        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": [
            "error",
            {
                "builtinGlobals": false,
                "ignoreDeclarationMerge": true
            }
        ],
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": [
            "error",
            {
                "builtinGlobals": false,
                "ignoreTypeValueShadow": true,
                "ignoreFunctionTypeParameterNameValueShadow": true
            }
        ],
        "no-throw-literal": "off",
        "@typescript-eslint/no-throw-literal": ["error"],
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": ["error"],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error"],
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["error"],
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": ["error"],
        "object-curly-spacing": "off",
        "@typescript-eslint/object-curly-spacing": ["error", "always"],
        "quotes": "off",
        "@typescript-eslint/quotes": ["error", "double", { "allowTemplateLiterals": true }],
        "require-await": "off",
        "@typescript-eslint/require-await": ["error"],
        "no-return-await": "off",
        "@typescript-eslint/return-await": ["error"],
        "semi": "off",
        "@typescript-eslint/semi": ["error", "always"],
        "space-before-function-paren": "off",
        "@typescript-eslint/space-before-function-paren": [
            "error",
            {
                "anonymous": "never",
                "named": "never",
                "asyncArrow": "always"
            }
        ],
        "space-infix-ops": "off",
        "@typescript-eslint/space-infix-ops": ["error", { "int32Hint": false }],
        "@typescript-eslint/no-floating-promises": ["error", { "ignoreIIFE": true }],


        // "no-extra-semi": "error",  // TypeScript extension overrides.

        // Possible errors.
        "no-await-in-loop": "error",
        // "no-console": "error",
        // "no-extra-parens": ["error", "functions"],  // TypeScript extension overrides.
        // "no-loss-of-precision": "error",  // TypeScript extension overrides.
        "no-promise-executor-return": "error",
        "no-template-curly-in-string": "error",
        "no-unreachable-loop": "error",
        "no-unsafe-optional-chaining": "error",
        "no-useless-backreference": "error",
        "require-atomic-updates": "error",

        // Best practices.
        // "accessor-pairs": "error",
        "array-callback-return": "error",
        "block-scoped-var": "error",
        "class-methods-use-this": "error",
        "consistent-return": "error",
        "curly": "error",
        "default-case": "error",
        "default-case-last": "error",
        // "default-param-last": "error",  // TypeScript extension overrides.
        "dot-location": ["error", "property"],
        // "dot-notation": ["error", { "allowKeywords": false }],  // TypeScript extension overrides.
        "eqeqeq": "error",
        "grouped-accessor-pairs": "error",
        "guard-for-in": "error",
        "no-caller": "error",
        "no-constructor-return": "error",
        "no-else-return": ["error", { allowElseIf: false }],
        // "no-empty-function": "error",  // TypeScript extension overrides.
        "no-eval": ["error"],
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-floating-decimal": "error",
        "no-implicit-coercion": "error",
        "no-implicit-globals": "error",
        // "no-implied-eval": ["error"],  // TypeScript extension overrides.
        // "no-invalid-this": "error",  // TypeScript extension overrides.
        "no-iterator": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        // "no-loop-func": "error",  // TypeScript extension overrides.
        // "no-magic-numbers": ["error", { "ignore": [-1, 0, 1, 2] }],  // TypeScript extension overrides.
        "no-multi-spaces": ["error", { ignoreEOLComments: true }],
        "no-multi-str": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "error",
        "no-proto": "error",
        "no-return-assign": "error",
        // "no-return-await": "error",  // TypeScript extension overrides.
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        // "no-throw-literal": "error",  // TypeScript extension overrides.
        "no-unmodified-loop-condition": "error",
        // "no-unused-expressions": "error",  // TypeScript extension overrides.
        "no-useless-call": "error",
        "no-useless-concat": "error",
        "no-useless-return": "error",
        // "no-void": "error",
        "prefer-named-capture-group": "error",
        "prefer-promise-reject-errors": "error",
        "prefer-regex-literals": "error",
        "radix": "error",
        // "require-await": "error",  // TypeScript extension overrides.
        "require-unicode-regexp": "error",
        "vars-on-top": "error",
        "wrap-iife": ["error", "outside"],
        "yoda": "error",

        // Strict mode.
        "strict": ["error", "safe"],

        // Variables
        // "init-declarations": ["error", "always"],  // TypeScript extension overrides.
        "no-label-var": "error",
        "no-restricted-globals": ["error", "event", "fdescribe"],
        // "no-shadow": ["error", { "builtinGlobals": false }],  // TypeScript extension overrides.
        // "no-use-before-define": "error",  // TypeScript extension overrides.

        // Stylistic issues.
        "array-bracket-newline": ["error", { "multiline": true }],
        "array-bracket-spacing": ["error", "never"],
        "array-element-newline": ["error", "consistent"],
        "block-spacing": "error",
        // "brace-style": "error",  // TypeScript extension overrides.
        "camelcase": "error",
        // "comma-dangle": ["error", "never"],  // TypeScript extension overrides.
        // "comma-spacing": "error",  // TypeScript extension overrides.
        "comma-style": "error",
        "computed-property-spacing": "error",
        "consistent-this": ["error", "self"],
        "eol-last": "error",
        // "func-call-spacing": ["error", "never"],  // TypeScript extension overrides.
        "func-style": ["error", "declaration", { "allowArrowFunctions": true }],
        "implicit-arrow-linebreak": ["error", "beside"],
        // "indent": ["error", 4, { "SwitchCase": 1, "outerIIFEBody": 1 }],  // TypeScript extension overrides.
        "jsx-quotes": ["error", "prefer-double"],
        "key-spacing": "error",
        // "keyword-spacing": "error",  // TypeScript extension overrides.
        "max-len": ["error", { "code": 160, "tabWidth": 4 }],
        "multiline-ternary": ["error", "always-multiline"],
        "new-cap": "error",
        "new-parens": "error",
        "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 2 }],
        // "no-array-constructor": "error",  // TypeScript extension overrides.
        "no-continue": "error",
        "no-lonely-if": "error",
        "no-multiple-empty-lines": ["error", { "max": 2, "maxBOF": 0, "maxEOF": 0 }],
        "no-nested-ternary": "error",
        "no-new-object": "error",
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "no-tabs": "error",
        "no-trailing-spaces": "error",
        "no-unneeded-ternary": "error",
        "no-whitespace-before-property": "error",
        "object-curly-newline": "error",
        // "object-curly-spacing": ["error", "always"],  // TypeScript extension overrides.
        "one-var": ["error", "never"],
        "operator-linebreak": ["error", "before"],
        "prefer-exponentiation-operator": "error",
        "prefer-object-spread": "error",
        // "quotes": ["error", "double", { "allowTemplateLiterals": true }],  // TypeScript extension overrides.
        // "semi": ["error", "always"],
        "semi-spacing": "error",
        "semi-style": "error",
        "space-before-blocks": "error",
        // "space-before-function-paren": [
        //     "error", {
        //         "anonymous": "always",
        //         "named": "never",
        //         "asyncArrow": "always"
        //     }
        // ],  // TypeScript extension overrides.
        "space-in-parens": "error",
        // "space-infix-ops": "error",  // TypeScript extension overrides.
        "space-unary-ops": [
            "error", {
                "words": true,
                "nonwords": false
            }
        ],
        "spaced-comment": ["error", "always", { "exceptions": ["@devdoc", "@sdkdoc"] }],
        "switch-colon-spacing": "error",
        "template-tag-spacing": "error",
        "unicode-bom": "error",
        "wrap-regex": "error",

        // ECMAScript 6
        "arrow-body-style": ["error", "as-needed"],
        "arrow-parens": "error",
        "arrow-spacing": "error",
        "generator-star-spacing": "error",
        "no-confusing-arrow": "error",
        // "no-duplicate-imports": "error",  // TypeScript extension overrides.
        "no-useless-computed-key": "error",
        // "no-useless-constructor": "error",  // TypeScript extension overrides.
        "no-useless-rename": "error",
        "no-var": "error",
        "object-shorthand": ["error", "properties"],
        "prefer-const": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "rest-spread-spacing": "error",
        "symbol-description": "error",
        "template-curly-spacing": "error",
        "yield-star-spacing": "error",
    }
}
