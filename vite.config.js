import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5185
	},
	base: '/webapp-lager/', // Ändra till ditt repo-namn
});
// vite.config.js
