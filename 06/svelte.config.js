import adapter from '@sveltejs/adapter-auto';

export default {
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter(),
		paths: {
			base: ''
		},
		csrf: {
			trustedOrigins: ['dbwebbyearone.ddev.site']
		}
	}
};
