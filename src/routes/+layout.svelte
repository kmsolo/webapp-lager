<script>
let { children } = $props();
  import { fly, fade } from 'svelte/transition';
  import { page } from '$app/stores';

  let menuOpen = $state(false);

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<header>
  <div class="title">Min Mobilapp i Kmom04</div>
  <button class="hamburger" onclick={toggleMenu} aria-label="Meny">
    {menuOpen ? '✖' : '☰'}
  </button>
</header>

{#if menuOpen}
  <nav transition:fly={{ y: -20, duration: 200 }}>
    <a href="/" onclick={toggleMenu}>🏠 Att skicka</a>
    <a href="/levererat" onclick={toggleMenu}>✅ Levererat</a>
  </nav>
{/if}

<main>
  {#key $page.url.pathname}
    <div in:fade={{ duration: 150 }}>
      {@render children()}
    </div>
  {/key}
</main>

<footer>© 2026 Kenneth – Mobilprojekt Från kmom04</footer>

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