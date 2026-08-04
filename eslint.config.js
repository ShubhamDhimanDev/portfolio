import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'build', '.react-router']),
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
      // Route modules (react-router.config.ts prerender + src/routes.ts) export
      // loader/meta/links alongside the component - that's the framework's
      // convention, not a fast-refresh hazard.
      'react-refresh/only-export-components': [
        'error',
        {
          allowExportNames: [
            'loader',
            'clientLoader',
            'action',
            'clientAction',
            'meta',
            'links',
            'handle',
            'shouldRevalidate',
            'ErrorBoundary',
            'HydrateFallback',
            'Layout',
          ],
        },
      ],
    },
  },
])
