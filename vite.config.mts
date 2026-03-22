import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(async () => ({
	plugins: [
		tanstackRouter({ target: 'solid', autoCodeSplitting: true }),
		tailwindcss(),
		solidPlugin(),
	],
	clearScreen: false,
	build: {
		target: 'esnext',
	},
	resolve: {
		tsconfigPaths: true,
	},
	server: {
		port: 1420,
		strictPort: true,
		watch: {
			ignored: ['**/src-tauri/**'],
		},
	},
}));
