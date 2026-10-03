// ESLint's own stack, with no third-party config package in between.
//
// This repository has outlived one of those already: `standard`, which is
// abandoned and pinned to eslint 8 — end of life since October 2024. Its
// successor, neostandard, is a config package too, so it is the same bet made
// again. @eslint/js and @stylistic are maintained by the ESLint project itself,
// and the rule set below is short enough to state outright, so there is no
// middleman left to go quiet.
//
// The goal is unchanged: keep the house style `standard` gave this code, and
// catch real mistakes. Where @stylistic's defaults disagree with the choices
// standard made, standard wins — those rules are listed, with its values.
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'

export default [
  {
    // The generated browser bundle, tap's cache, coverage output, and the
    // vendored excanvas shim the example server loads. None of it ours to style.
    ignores: ['build/**', 'coverage/**', '.tap/**', 'examples/vendors/**']
  },

  js.configs.recommended,

  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    commaDangle: 'never',
    braceStyle: '1tbs',
    arrowParens: true,
    jsx: false
  }),

  {
    rules: {
      // eslint-config-standard's own values for the three rules where
      // @stylistic's customize preset differs from it.
      '@stylistic/operator-linebreak': ['error', 'after', {
        overrides: { '?': 'before', ':': 'before', '|>': 'before' }
      }],
      '@stylistic/space-before-function-paren': ['error', 'always'],
      // avoidEscape is the reason examples/server.js may quote a sentence
      // containing an apostrophe with double quotes.
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'never' }],
      // 'as-needed', not customize's 'consistent-as-needed': terminal-small.js has
      // to quote '00' and '01' and should not have to quote 10 and 11 to match.
      '@stylistic/quote-props': ['error', 'as-needed'],
      // standard does not enable this one at all, and the codebase is written
      // accordingly: a one-line `function () { ... }` argument reads better than
      // the four lines the rule would force.
      '@stylistic/max-statements-per-line': 'off',
      // Also not a rule standard had. The two places it fires are deliberately
      // aligned — a multi-line `if` whose clauses line up under the open paren
      // with a comment each, and a paragraph of concatenated prose — and its fix
      // would pull both out of alignment to satisfy an opinion we never held.
      '@stylistic/indent-binary-ops': 'off',

      // Not in eslint's recommended set, but standard enabled it and it earns its
      // place: a `new RegExp('...')` with a constant pattern is a literal written
      // the long way, and the escaping is easier to get wrong.
      'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }]
    }
  },

  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node }
    }
  },

  {
    // The browser half of the package, and the example server's client code.
    files: ['lib/browser.js', 'lib/renderer/canvas.js', 'helper/to-sjis-browser.js', 'examples/**/*.js'],
    languageOptions: { globals: { ...globals.browser } }
  },

  {
    files: ['**/*.mjs'],
    languageOptions: { sourceType: 'module' }
  }
]
