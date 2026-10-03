<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();

  let isOnline = $state(true);

  onMount(() => {
    isOnline = navigator.onLine;
    window.addEventListener('online', () => (isOnline = true));
    window.addEventListener('offline', () => (isOnline = false));
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="top-bar"></div>

<header>
  <div class="title">Tågförseningar</div>
  <nav>
    <a href="/" class:active={$page.url.pathname === '/'}>Lista</a>
    <a href="/karta" class:active={$page.url.pathname === '/karta'}>Karta</a>
    <a href="/arkitektur" class:active={$page.url.pathname === '/arkitektur'}>Arkitektur</a>
    <a href="/redovisning" class:active={$page.url.pathname === '/redovisning'}>Redovisning</a>
    <a href="https://dbwebbyearone.ddev.site:8443/webapp/mobil/index.php">Lagerapp</a>
  </nav>
</header>

{#if !isOnline}
  <div class="offline-banner">
    ⚠️ Du är offline — data kan vara inaktuell.
  </div>
{/if}

<main>
  {#key $page.url.pathname}
    <div in:fade={{ duration: 150 }}>
      {@render children()}
    </div>
  {/key}
</main>

<style>
  :global(body) {
    margin: 0;
    background: #f5f2f0;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #2b1114;
  }
  :global(h1) {
    font-family: Georgia, 'Times New Roman', serif;
    color: #7a1f2c;
  }
  .top-bar {
    height: 6px;
    background: #7a1f2c;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: white;
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid #eee;
  }
  .title {
    font-weight: bold;
    font-size: 1.3rem;
    color: #e2001a;
    font-family: Georgia, 'Times New Roman', serif;
  }
  nav {
    display: flex;
    gap: 1.25rem;
  }
  nav a {
    color: #555;
    text-decoration: none;
    font-size: 0.9rem;
    padding-bottom: 0.25rem;
  }
  nav a.active {
    color: #7a1f2c;
    font-weight: bold;
    border-bottom: 3px solid #7a1f2c;
  }
  .offline-banner {
    background: #fff3cd;
    color: #5a4300;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.9rem;
    border-bottom: 1px solid #ffe08a;
  }
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }
</style>
