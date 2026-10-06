<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { getDeliveredOrders } from '$lib/api.js';

  let orders = $state([]);

  onMount(async () => {
    orders = await getDeliveredOrders();
  });
</script>

<h1>Levererat</h1>

{#if orders.length === 0}
  <p>Inga leveranser ännu.</p>
{:else}
  <ul>
    {#each orders as order, i (order.id)}
      <li in:fly={{ y: 10, duration: 200, delay: i * 50 }}>
        <img src={order.image_url} alt={`Levererad order ${order.order_number}`} />
        <div>
          <strong>{order.order_number}</strong> – {order.customer_name}
          <br><small>{order.address}</small>
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul { list-style: none; padding: 0; }
  li {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }
  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
  }
</style>