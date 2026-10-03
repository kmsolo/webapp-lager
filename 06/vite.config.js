import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			manifest: {
				name: 'Kenneths Mobilapp',
				short_name: 'Mobilapp',
				description: 'Leveransapp för kmom06',
				icons: [
					{
						src: '/icons/infinity_512.webp',
						sizes: '512x512',
						type: 'image/webp'
					},
					{
						src: '/icons/infinity_192.webp',
						sizes: '192x192',
						type: 'image/webp'
					}
				],
				background_color: '#f7c6d0',
				display: 'standalone',
				theme_color: '#f7c6d0'
			},
			devOptions: {
				enabled: true
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,webp,png,svg}'],
				runtimeCaching: [
					{
						urlPattern: ({ url }) => url.hostname === 'dbwebbyearone.ddev.site',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			},
			registerType: 'autoUpdate'
		})
	],
	server: {
		host: true,
		port: 5183,
		strictPort: true,
		allowedHosts: ['.ddev.site']
	}
});
