import { fixupPluginRules, includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import jsonPlugin from 'eslint-plugin-json'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

const mapName = (name, configs) =>
	configs.map((conf, index) => ({
		name: `${name}-${index}`,
		...conf,
	}))

export default tseslint.config(
	includeIgnoreFile(gitignorePath),
	{
		name: 'eslint',
		...eslint.configs.recommended,
	},
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			...mapName('TypeScript-strict', tseslint.configs.strictTypeChecked),
			...mapName('TypeScript-stylistic', tseslint.configs.stylisticTypeChecked),
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname, // use import.meta.dirname after updating to Node 20+
			},
		},
		rules: {
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
		},
	},
	{
		name: 'React',
		files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
		extends: [
			reactPlugin.configs.flat.recommended,
			reactPlugin.configs.flat['jsx-runtime'], // for React 17+
		],
		settings: {
			react: {
				version: 'detect',
			},
		},
		languageOptions: {
			...reactPlugin.configs.flat.recommended.languageOptions,
			globals: {
				...globals.serviceworker,
				...globals.browser,
			},
		},
	},
	// https://github.com/facebook/react/issues/28313
	{
		name: 'react hooks',
		plugins: {
			'react-hooks': fixupPluginRules(reactHooksPlugin),
		},
		rules: {
			...reactHooksPlugin.configs.recommended.rules,
		},
	},
	{
		name: 'next',
		plugins: {
			'@next/next': fixupPluginRules(nextPlugin),
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
		},
	},
	{
		name: 'json',
		...jsonPlugin.configs.recommended,
	},
	{
		name: 'Prettier',
		...prettierPlugin,
	},

	// TODO add linting for test files
	// {
	// 	files: ['test/**', '**/__tests__/**', '**/*.test.js'],
	// 	plugins: ['jest'],
	// 	extends: ['plugin:jest/recommended', 'plugin:jest/style'],
	// },
)
