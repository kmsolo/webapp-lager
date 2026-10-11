<!-- Levererade ordrar med leveransfoto -->
<script>
  import { onMount } from 'svelte'
  export let apiUrl = ''

  let orders = []
  let loading = true
  let error = ''

  onMount(async () => {
    try {
      const res = await fetch(`${apiUrl}/orders?status=levererad`)
      if (!res.ok) throw new Error(`HTTP-fel: ${res.status}`)
      orders = await res.json()
    } catch (e) {
      console.error(e)
      error = 'Kunde inte hämta levererade ordrar.'
    } finally {
      loading = false
    }
  })
</script>

<section class="list-frame">
  <h2 class="section-title">Levererade ordrar</h2>
  {#if loading}
    <p>Laddar…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if orders.length === 0}
    <p>Inga ordrar är levererade än.</p>
  {:else}
    <div class="order-grid">
      {#each orders as order (order.id)}
        <article class="order-card">
          <h3>Order #{order.id} – {order.customer}</h3>
          <p>{order.product_name}, {order.quantity} st</p>
          <p>Levererad: {order.delivered_at}</p>
          {#if order.delivery_photo}
            <img src={order.delivery_photo} alt="Leveransfoto order {order.id}" class="delivery-photo" loading="lazy" />
          {/if}
        </article>
      {/each}
    </div>
  {/if}
</section>
