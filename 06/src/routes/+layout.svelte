<script>
  import { fly, fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';

  let menuOpen = $state(false);
  let isOnline = $state(true);

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  onMount(() => {
    isOnline = navigator.onLine;
    window.addEventListener('online', () => (isOnline = true));
    window.addEventListener('offline', () => (isOnline = false));
  });
if (browser && !dev) {
  navigator.serviceWorker?.register('/sw.js');
}

</script>

<header>
  <div class="title">Min Mobilapp</div>
  <button class="hamburger" onclick={toggleMenu} aria-label="Meny">
    {menuOpen ? '✖' : '☰'}
  </button>
</header>

{#if !isOnline}
  <div class="offline-banner">
    ⚠️ Du är offline — data kan vara inaktuell och går inte att uppdatera just nu.
  </div>
{/if}

{#if menuOpen}
  <nav transition:fly={{ y: -20, duration: 200 }}>
    <a href="/" onclick={toggleMenu}>🏠 Att skicka</a>
    <a href="/levererat" onclick={toggleMenu}>✅ Levererat</a>
  </nav>
{/if}

<main>
  {#key $page.url.pathname}
    <div in:fade={{ duration: 150 }}>
      <slot />
    </div>
  {/key}
</main>

<footer>© 2026 Kenneth – Mobilprojekt Från kmom06</footer>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f7c6d0;
    position: sticky;
    top: 0;
    z-index: 20;
  }
  .title { font-weight: bold; }
  .hamburger {
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
  }
  .offline-banner {
    background: #ffe08a;
    color: #5a4300;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  nav {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    z-index: 10;
  }
  nav a {
    padding: 1rem;
    text-decoration: none;
    color: #333;
  }
  nav a:hover { background: #f3b1bf; }
  main { max-width: 480px; margin: 0 auto; padding: 1rem; }
  footer { text-align: center; padding: 1rem; background: #f7c6d0; }
</style>