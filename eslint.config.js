import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `dist`/`release` are build output; `build` holds the electron icon source;
  // `output` holds standalone Remotion projects with their own (incompatible)
  // eslint config; `.agents`/`.claude` hold skill reference assets — none of
  // these should be linted as part of the app.
  globalIgnores(['dist', 'release', 'build', 'output', '.agents', '.claude']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Surface these as warnings (not gate-failing errors) so they can be
      // cleaned up incrementally. The `any` casts predate the (previously
      // broken) lint setup; the react-hooks/refresh rules are React-Compiler-era
      // strictness this non-Compiler codebase doesn't fully satisfy yet.
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
])
