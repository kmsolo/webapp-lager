<!-- src/lib/DeliveryForm.svelte -->
<script>
  import { onMount } from 'svelte'

  export let apiUrl = ''

  let products = []
  let loadingProducts = false
  let deliveryForm = {
    product_id: '',
    amount: '',
    delivery_date: new Date().toISOString().slice(0, 10),
    comment: '',
  }

  let deliveryFormError = ''
  let savingDelivery = false

  onMount(async () => {
    loadingProducts = true
    try {
      const response = await fetch(`${apiUrl}/products`)
      console.log('Hämtar produkter från:', `${apiUrl}/products`)
      if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`)
      products = await response.json()
      console.log('Produkter hämtade:', products)
    } catch (error) {
      console.error('Kunde inte hämta produkter:', error)
      deliveryFormError = 'Kunde inte hämta produkter.'
    } finally {
      loadingProducts = false
    }
  })

  async function saveDelivery(event) {
    event.preventDefault()
    deliveryFormError = ''

    const productId = Number(deliveryForm.product_id)
    const amount = Number(deliveryForm.amount)

    if (!Number.isInteger(productId) || productId <= 0) {
      deliveryFormError = 'Välj en produkt.'
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      deliveryFormError = 'Ange ett antal större än noll.'
      return
    }

    if (!deliveryForm.delivery_date) {
      deliveryFormError = 'Välj ett leveransdatum.'
      return
    }

    savingDelivery = true

    try {
      console.log('Sparar inleverans:', { product_id: productId, amount, delivery_date: deliveryForm.delivery_date })
      const response = await fetch(`${apiUrl}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          amount,
          delivery_date: deliveryForm.delivery_date,
          comment: deliveryForm.comment.trim(),
        }),
      })

      console.log('Svar från API:', response.status)

      if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`)

      deliveryForm = {
        product_id: '',
        amount: '',
        delivery_date: new Date().toISOString().slice(0, 10),
        comment: '',
      }

      window.location.hash = 'deliveries'
    } catch (error) {
      console.error('Kunde inte spara inleveransen:', error)
      deliveryFormError = 'Kunde inte spara inleveransen.'
    } finally {
      savingDelivery = false
    }
  }

  function cancel() {
    window.location.hash = 'deliveries'
  }
</script>

<section class="card" aria-labelledby="new-delivery-title">
  <h2 id="new-delivery-title" class="section-title">Ny inleverans</h2>

  {#if loadingProducts}
    <p>Laddar produkter...</p>
  {:else if products.length === 0}
    <p class="error">Inga produkter tillgängliga. Skapa först en produkt.</p>
  {:else}
    <form class="form" onsubmit={saveDelivery}>
      <label for="delivery-product">Produkt</label>
      <select id="delivery-product" bind:value={deliveryForm.product_id} required>
        <option value="">Välj produkt</option>
        {#each products as product (product.id)}
          <option value={product.id}>{product.name} — saldo: {product.stock} st</option>
        {/each}
      </select>

      <label for="delivery-amount">Antal</label>
      <input id="delivery-amount" type="number" min="1" step="1" bind:value={deliveryForm.amount} required />

      <label for="delivery-date">Leveransdatum</label>
      <input id="delivery-date" type="date" bind:value={deliveryForm.delivery_date} required />

      <label for="delivery-comment">Kommentar (valfri)</label>
      <input id="delivery-comment" type="text" bind:value={deliveryForm.comment} placeholder="T.ex. leverantör eller följesedel" />

      {#if deliveryFormError}
        <p class="error">{deliveryFormError}</p>
      {/if}

      <div class="btn-row">
        <button class="primary-btn" type="submit" disabled={savingDelivery}>
          {savingDelivery ? 'Sparar...' : 'Spara inleverans'}
        </button>
        <button class="secondary-btn" type="button" onclick={cancel}>
          Avbryt
        </button>
      </div>
    </form>
  {/if}
</section>