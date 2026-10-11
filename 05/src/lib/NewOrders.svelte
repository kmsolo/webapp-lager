<!-- src/lib/NewOrders.svelte: välj nya ordrar som ska packas och levereras -->
<script>
  import { onMount } from 'svelte'

  export let apiUrl = ''

  let orders = []
  let loading = true
  let error = ''
  let message = ''

  onMount(loadOrders)

  async function loadOrders() {
    loading = true
    error = ''
    try {
      const res = await fetch(`${apiUrl}/orders?status=ny`)
      if (!res.ok) throw new Error(`HTTP-fel: ${res.status}`)
      orders = await res.json()
    } catch (e) {
      console.error(e)
      error = 'Kunde inte hämta nya ordrar.'
    } finally {
      loading = false
    }
  }

  async function packOrder(order) {
    message = ''
    error = ''
    try {
      const res = await fetch(`${apiUrl}/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'packad' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP-fel: ${res.status}`)
      message = `Order #${order.id} är packad. Lagersaldot minskades med ${order.quantity} st.`
      await loadOrders() // uppdatera listan (saldot för andra ordrar med samma produkt ändras)
    } catch (e) {
      console.error(e)
      error = e.message
    }
  }
</script>

<section class="list-frame">
  <h2 class="section-title">Nya ordrar</h2>
  <p>Välj en order att packa. Lagersaldot minskas, och ordern hamnar under Ordrar, redo att levereras.</p>

  {#if message}<p role="status">✅ {message}</p>{/if}
  {#if error}<p style="color: red;">{error}</p>{/if}

  {#if loading}
    <p>Laddar…</p>
  {:else if orders.length === 0}
    <p>Det finns inga nya ordrar.</p>
  {:else}
    <div class="order-grid">
      {#each orders as order (order.id)}
        {@const enough = order.product_stock >= order.quantity}
        <article class="order-card">
          <h3>Order #{order.id} – {order.customer}</h3>
          <p>{order.product_name}, {order.quantity} st</p>
          <p style="color: {enough ? 'inherit' : '#b91c1c'};">
            Lager: {order.product_stock} st {enough ? '' : '⚠️ räcker inte'}
          </p>
          <p>Lagerplats: {order.product_location ?? '-'}</p>
          <p>Adress: {order.address ?? '–'}</p>
          <button class="primary-btn" type="button" onclick={() => packOrder(order)} disabled={!enough}>
            📦 Packa order
          </button>
        </article>
      {/each}
    </div>
  {/if}
</section>
