<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { getPackedOrders } from '$lib/api.js';

  let orders = $state([]);

  onMount(async () => {
    orders = await getPackedOrders();
  });
</script>

<h1>Redo att skickas</h1>

{#if orders.length === 0}
  <p>Inga ordrar just nu.</p>
{:else}
  <ul>
    {#each orders as order, i (order.id)}
      <li in:fly={{ y: 10, duration: 200, delay: i * 50 }}>
        <a href={`/order/${order.id}`}>
          <strong>{order.order_number}</strong> – {order.customer_name}
          <br><small>{order.address}</small>
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul { list-style: none; padding: 0; }
  li a {
    display: block;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    text-decoration: none;
    color: #333;
  }
</style>