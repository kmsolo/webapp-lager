<!-- src/lib/Deliveries.svelte -->
<script>
  import { onMount } from 'svelte'

  export let apiUrl = ''

  let deliveries = []
  let loadingDeliveries = false
  let deliveriesError = ''

  onMount(async () => {
    loadDeliveries()
  })

  async function loadDeliveries() {
    loadingDeliveries = true
    deliveriesError = ''

    try {
      const response = await fetch(`${apiUrl}/deliveries`)
      if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`)
      deliveries = await response.json()
    } catch (error) {
      console.error('Kunde inte hämta inleveranser:', error)
      deliveriesError = 'Kunde inte hämta inleveranser.'
    } finally {
      loadingDeliveries = false
    }
  }
</script>

<section class="list-frame" aria-labelledby="deliveries-title">
  <h2 id="deliveries-title" class="section-title">Inleveranser</h2>

  {#if loadingDeliveries}
    <p>Laddar inleveranser...</p>
  {:else if deliveriesError}
    <p class="error">{deliveriesError}</p>
  {:else if deliveries.length === 0}
    <p>Det finns inga registrerade inleveranser.</p>
  {:else}
    <ul class="delivery-list">
      {#each deliveries as delivery (delivery.id)}
        <li class="delivery-item">
          <strong>{delivery.product_name}</strong>
          <p><strong>Antal:</strong> {delivery.amount} st</p>
          <p><strong>Datum:</strong> {delivery.delivery_date}</p>
          {#if delivery.comment}
            <p><strong>Kommentar:</strong> {delivery.comment}</p>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  <div class="btn-row">
    <button class="primary-btn" type="button" onclick={() => window.location.hash = 'new-delivery'}>
      ➕ Registrera ny inleverans
    </button>
  </div>
</section>