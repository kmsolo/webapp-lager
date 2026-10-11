<!-- src/lib/OrderForm.svelte: skapa ny order från kund + produkt -->
<script>
  import { onMount } from 'svelte'

  export let apiUrl = ''

  let customers = []
  let products = []
  let customerId = ''
  let productId = ''
  let quantity = 1
  let unitPrice = ''
  let address = ''
  let error = ''
  let loading = true

  $: selectedCustomer = customers.find((c) => String(c.id) === String(customerId))
  $: selectedProduct = products.find((p) => String(p.id) === String(productId))

  onMount(async () => {
    try {
      const [cRes, pRes] = await Promise.all([fetch(`${apiUrl}/customers`), fetch(`${apiUrl}/products`)])
      if (!cRes.ok || !pRes.ok) throw new Error('Kunde inte hämta data.')
      customers = await cRes.json()
      products = await pRes.json()
    } catch (e) {
      console.error(e)
      error = 'Kunde inte hämta kunder och produkter.'
    } finally {
      loading = false
    }
  })

  async function createOrder(event) {
    event.preventDefault()
    error = ''
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: Number(customerId),
          product_id: Number(productId),
          quantity: Number(quantity),
          unit_price: Number(unitPrice),
          address,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP-fel: ${res.status}`)
      window.location.hash = 'new-orders' // visa nya ordrar, där ordern kan packas
    } catch (e) {
      error = e.message
    }
  }
</script>

<section class="card">
  <h2 class="section-title">Ny order</h2>

  {#if loading}
    <p>Laddar…</p>
  {:else if customers.length === 0}
    <p>Du behöver skapa en kund först (fliken Kunder).</p>
  {:else}
    <form onsubmit={createOrder}>
      <label for="o-customer">Kund</label>
      <select id="o-customer" bind:value={customerId} required>
        <option value="" disabled>Välj kund…</option>
        {#each customers as c (c.id)}
          <option value={c.id}>{c.name}</option>
        {/each}
      </select>

      <label for="o-product">Produkt</label>
      <select id="o-product" bind:value={productId} required>
        <option value="" disabled>Välj produkt…</option>
        {#each products as p (p.id)}
          <option value={p.id}>{p.name} (lager: {p.stock})</option>
        {/each}
      </select>

      <label for="o-qty">Antal</label>
      <input id="o-qty" type="number" min="1" step="1" bind:value={quantity} required />
      {#if selectedProduct && Number(quantity) > selectedProduct.stock}
        <p style="color: #b45309;">⚠️ Det finns bara {selectedProduct.stock} st i lager.</p>
      {/if}

      <label for="o-price">Pris per styck (kr)</label>
      <input id="o-price" type="number" min="0" step="any" bind:value={unitPrice} required />

      <label for="o-address">Leveransadress</label>
      <input id="o-address" bind:value={address} placeholder={selectedCustomer?.address ?? 'Gatuadress 1, Stad'} />
      <small>Lämna tom för att använda kundens adress.</small>

      <button class="primary-btn" type="submit">Skapa order</button>
    </form>
  {/if}

  {#if error}<p style="color: red;">{error}</p>{/if}
</section>
