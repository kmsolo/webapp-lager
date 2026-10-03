<script>
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Hem' },
		{ href: '/about', label: 'Om' },
		{ href: '/webapp', label: 'Tillbaka till lagerappen' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
	<nav>
		{#each links as link}
			<a
				href={resolve(link.href)}
				aria-current={page.url.pathname === link.href ? 'page' : undefined}
			>
				{link.label}
			</a>
		{/each}
	</nav>
</header>

<main>
	{@render children()}
</main>

<style>
	header {
		background: #222;
		padding: 1rem;
	}
	nav {
		display: flex;
		gap: 1rem;
	}
	a {
		color: #fff;
		text-decoration: none;
	}
	a[aria-current='page'] {
		font-weight: bold;
		border-bottom: 2px solid #ff3e00;
	}
	main {
		padding: 1rem;
	}
</style>