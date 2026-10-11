<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'

  import Products from './lib/Products.svelte'
  import ProductForm from './lib/ProductForm.svelte'
  import Deliveries from './lib/Deliveries.svelte'
  import DeliveryForm from './lib/DeliveryForm.svelte'
  import NewOrders from './lib/NewOrders.svelte'
  import Orders from './lib/Orders.svelte'
  import OrderMap from './lib/OrderMap.svelte'
  import Camera from './lib/Camera.svelte'
  import Delivered from './lib/Delivered.svelte'

  const apiUrl = 'http://localhost:3001'

  // Vilken vy som visas just nu
  let activeView = 'products'
  let products = []
  let selectedOrder = null   // vald order (order-details)
  let editProduct = null     // vald produkt (edit-product)

  // Sparas från OrderMap (GPS) och Camera (foto)
  let savedLocation = null
  let savedImageUrl = ''

  // Vyer som barnkomponenter får byta till via location.hash
  const hashViews = ['products', 'new-product', 'deliveries', 'new-delivery', 'new-orders', 'orders', 'delivered']

  onMount(() => {
    const syncHash = () => {
      const view = location.hash.slice(1)
      if (hashViews.includes(view)) showView(view)
    }
    window.addEventListener('hashchange', syncHash)
    loadProducts()
    return () => window.removeEventListener('hashchange', syncHash)
  })

  function showView(view) {
    activeView = view
    selectedOrder = null
    editProduct = null
    if (view === 'products') loadProducts()
  }

  async function loadProducts() {
    try {
      const response = await fetch(`${apiUrl}/products`)
      if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`)
      products = await response.json()
    } catch (error) {
      console.error('Kunde inte hämta produkter:', error)
    }
  }

  function openEditProduct(event) {
    editProduct = event.detail
    activeView = 'edit-product'
  }

  async function deleteProduct() {
    await loadProducts()
  }

  function openOrder(order) {
    selectedOrder = order
    savedLocation = null
    savedImageUrl = ''
    activeView = 'order-details'
  }

  function handleGPSSaved(location) {
    savedLocation = location
  }

  function handleCameraSaved(url) {
    savedImageUrl = url
  }

  async function confirmDelivery() {
    if (!selectedOrder || !savedLocation || !savedImageUrl) {
      alert('Du behöver både GPS-position och ett foto.')
      return
    }
    if (!window.confirm('Bekräfta att ordern är levererad?')) return

    try {
      const response = await fetch(`${apiUrl}/orders/${selectedOrder.id}/deliver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: savedLocation.latitude,
          longitude: savedLocation.longitude,
          photo_url: savedImageUrl,
        }),
      })
      if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`)

      alert('Leverans bekräftad! 🎉')
      showView('delivered')
    } catch (error) {
      console.error('Kunde inte bekräfta leverans:', error)
      alert('Kunde inte bekräfta leverans. Försök igen.')
    }
  }
</script>

<svelte:head>
  <title>Lagerapp – Del 4</title>
</svelte:head>

<header class="topbar">
  <div class="header-inner">
    <h1>Lagerapp – Del 4</h1>
    <nav class="app-nav" aria-label="Huvudmeny">
      <button class="nav-btn" class:active-nav={activeView === 'products'} type="button" onclick={() => showView('products')}>📦 Produkter</button>
      <button class="nav-btn" class:active-nav={activeView === 'new-product'} type="button" onclick={() => showView('new-product')}>🎁 Ny produkt</button>
      <button class="nav-btn" class:active-nav={activeView === 'deliveries'} type="button" onclick={() => showView('deliveries')}>📥 Inleveranser</button>
      <button class="nav-btn" class:active-nav={activeView === 'new-delivery'} type="button" onclick={() => showView('new-delivery')}>➕ Ny inleverans</button>
      <button class="nav-btn" class:active-nav={activeView === 'new-orders'} type="button" onclick={() => showView('new-orders')}>🆕 Nya ordrar</button>
      <button class="nav-btn" class:active-nav={activeView === 'orders'} type="button" onclick={() => showView('orders')}>🚚 Ordrar</button>
      <button class="nav-btn" class:active-nav={activeView === 'delivered'} type="button" onclick={() => showView('delivered')}>✅ Levererade</button>
    </nav>
  </div>
</header>

<main>
  {#key activeView}
    <div in:fly={{ x: 18, duration: 180 }}>
      {#if activeView === 'products'}
        <Products {products} {apiUrl} on:editProduct={openEditProduct} on:deleteProduct={deleteProduct} />

      {:else if activeView === 'new-product'}
        <ProductForm {apiUrl} mode="create" on:saved={() => showView('products')} on:cancel={() => showView('products')} />

      {:else if activeView === 'edit-product' && editProduct}
        <ProductForm {apiUrl} mode="edit" product={editProduct} on:saved={() => showView('products')} on:cancel={() => showView('products')} />

      {:else if activeView === 'deliveries'}
        <Deliveries {apiUrl} />

      {:else if activeView === 'new-delivery'}
        <DeliveryForm {apiUrl} />

      {:else if activeView === 'new-orders'}
        <NewOrders {apiUrl} />

      {:else if activeView === 'orders'}
        <Orders {apiUrl} {openOrder} />

      {:else if activeView === 'delivered'}
        <Delivered {apiUrl} />

      {:else if activeView === 'order-details' && selectedOrder}
        <section class="card">
          <button class="secondary-btn" type="button" onclick={() => showView('orders')}>← Tillbaka till ordrar</button>
          <h2 class="section-title">Order #{selectedOrder.id}</h2>

          <div class="order-details">
            <p><strong>Kund:</strong> {selectedOrder.customer}</p>
            <p><strong>Produkt:</strong> {selectedOrder.product_name ?? 'Okänd'}</p>
            <p><strong>Antal:</strong> {selectedOrder.quantity} st</p>
            <p><strong>Pris:</strong> {selectedOrder.unit_price} kr</p>
            <p><strong>Lagerplats:</strong> {selectedOrder.product_location ?? '-'}</p>
            <p><strong>Leveransadress:</strong> {selectedOrder.address ?? '-'}</p>
            <p><strong>Datum:</strong> {selectedOrder.created_at}</p>
            <p><strong>Status:</strong> {selectedOrder.status === 'packad' ? 'Packad (200)' : 'Levererad'}</p>
          </div>

          {#if selectedOrder.status === 'packad'}
            <OrderMap address={selectedOrder.address} onposition={handleGPSSaved} />

            <div style="margin-top: 1rem; padding: 0.75rem; background: #f5f5f5; border-radius: 8px;">
              <p style="margin-bottom: 0.5rem; font-weight: 600;">Leveransförberedelser:</p>
              <p style="color: {savedLocation ? 'green' : '#666'};">
                {savedLocation ? '✅' : '⬜'} GPS: {savedLocation ? `${savedLocation.latitude.toFixed(4)}, ${savedLocation.longitude.toFixed(4)}` : 'Inte hämtad'}
              </p>
              <p style="color: {savedImageUrl ? 'green' : '#666'};">
                {savedImageUrl ? '✅' : '⬜'} Foto: {savedImageUrl ? 'Uppladdat' : 'Inte taget'}
              </p>
            </div>

            <Camera onsaved={handleCameraSaved} />

            <div class="btn-row" style="margin-top: 1rem;">
              <button class="danger-btn" type="button" onclick={confirmDelivery} disabled={!savedLocation || !savedImageUrl}>
                Bekräfta leverans
              </button>
            </div>
          {/if}
        </section>
      {/if}
    </div>
  {/key}
</main>