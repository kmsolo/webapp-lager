import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true,
		port: 5180,
		strictPort: true,
		allowedHosts: ['.ddev.site']
	}
});
