<!-- src/lib/Orders.svelte -->
<script>
  import { onMount } from 'svelte'

  export let apiUrl = ''
  export let openOrder = null

  let orders = []
  let loadingOrders = false
  let ordersError = ''

  onMount(() => {
    loadOrders()
  })

  async function loadOrders() {
    loadingOrders = true
    ordersError = ''

    try {
      const response = await fetch(`${apiUrl}/orders?status=packad`)
      if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`)
      orders = await response.json()
    } catch (error) {
      console.error('Kunde inte hämta packade ordrar:', error)
      ordersError = 'Kunde inte hämta packade ordrar.'
    } finally {
      loadingOrders = false
    }
  }
</script>

<section class="list-frame" aria-labelledby="orders-title">
  <h2 id="orders-title" class="section-title">Ordrar redo att skickas</h2>
  <p>Här visas ordrar med status <strong>Packad (200)</strong>.</p>

  {#if loadingOrders}
    <p>Laddar packade ordrar...</p>
  {:else if ordersError}
    <p class="error">{ordersError}</p>
  {:else if orders.length === 0}
    <p>Det finns inga ordrar med status Packad (200).</p>
  {:else}
    <div class="order-grid">
      {#each orders as order (order.id)}
        <article class="order-card">
          <div class="order-card-header">
            <h3>Order #{order.id}</h3>
            <span class="status-badge status-packed">Packad (200)</span>
          </div>
          <div class="order-details">
            <p><strong>Kund:</strong> {order.customer}</p>
            <p><strong>Produkt:</strong> {order.product_name ?? 'Okänd'}</p>
            <p><strong>Antal:</strong> {order.quantity} st</p>
            <p><strong>Lagerplats:</strong> {order.product_location ?? '-'}</p>
            <p><strong>Datum:</strong> {order.created_at}</p>
          </div>
          <div class="btn-row">
            <button class="primary-btn" type="button" onclick={() => openOrder(order)}>
              Visa order
            </button>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</section>