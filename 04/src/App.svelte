<script>
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'

  let activeView = 'products'
  let location = null
  let locationError = ''
  let gettingLocation = false
  let selectedImageUrl = ''
  let selectedOrder = null

  let products = []
  let productsError = ''
  let loadingProducts = true
let productForm = {
  id: null,
  name: '',
  stock: '',
  location: '',
}

let productMessage = ''
let productFormError = ''
let savingProduct = false

function resetProductForm() {
  productForm = {
    id: null,
    name: '',
    stock: '',
    location: '',
  }

  productMessage = ''
  productFormError = ''
}

function openNewProduct() {
  resetProductForm()
  activeView = 'new-product'
}

function openEditProduct(product) {
  productForm = {
    id: product.id,
    name: product.name,
    stock: String(product.stock),
    location: product.location,
  }

  productMessage = ''
  productFormError = ''
  activeView = 'edit-product'
}

async function saveProduct() {
  productFormError = ''
  productMessage = ''

  const name = productForm.name.trim()
  const location = productForm.location.trim()
  const stock = Number(productForm.stock)

  if (!name || !location || !Number.isFinite(stock) || stock < 0) {
    productFormError =
      'Fyll i produktnamn, lagerplats och ett lagersaldo som är noll eller större.'
    return
  }

  savingProduct = true

  try {
    const isEdit = productForm.id !== null
    const url = isEdit
      ? `http://localhost:3001/products/${productForm.id}`
      : 'http://localhost:3001/products'

    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        stock,
        location,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP-fel: ${response.status}`)
    }

    await loadProducts()

    productMessage = isEdit
      ? 'Produkten har uppdaterats.'
      : 'Produkten har lagts till.'

    activeView = 'products'
    resetProductForm()
  } catch (error) {
    console.error('Kunde inte spara produkt:', error)
    productFormError = 'Kunde inte spara produkten. Kontrollera att API-servern körs.'
  } finally {
    savingProduct = false
  }
}

async function deleteProduct(product) {
  const confirmed = window.confirm(
    `Vill du verkligen ta bort "${product.name}"?`,
  )

  if (!confirmed) {
    return
  }

  try {
    const response = await fetch(
      `http://localhost:3001/products/${product.id}`,
      {
        method: 'DELETE',
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP-fel: ${response.status}`)
    }

    await loadProducts()
  } catch (error) {
    console.error('Kunde inte ta bort produkt:', error)
    productsError = 'Kunde inte ta bort produkten. Kontrollera API-servern.'
  }
}
  async function loadProducts() {
    try {
      const response = await fetch('http://localhost:3001/products')

      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`)
      }

      products = await response.json()
    } catch (error) {
      console.error('Kunde inte hämta produkter:', error)
      productsError = 'Kunde inte hämta produkter från den lokala databasen.'
    } finally {
      loadingProducts = false
    }
  }

  onMount(() => {
    loadProducts()
  })
  function showView(view) {
  activeView = view
  selectedOrder = null
}

  const orders = [
    {
      id: 101,
      customer: 'Anna Andersson',
      address: 'Drottninggatan 12, Helsingborg',
      status: 200,
      items: 3,
    },
    {
      id: 102,
      customer: 'Erik Svensson',
      address: 'Södergatan 8, Helsingborg',
      status: 200,
      items: 2,
    },
    {
      id: 103,
      customer: 'Maria Nilsson',
      address: 'Rådhustorget 4, Helsingborg',
      status: 200,
      items: 5,
    },
  ]

  // Resten av dina funktioner fortsätter under detta block...
</script>
<svelte:head>
  <title>Lagerapp – Del 4</title>
  <meta
    name="description"
    content="Lagerapp med ordrar, GPS, karta och kamera."
  />
</svelte:head>

<header class="topbar">
  <div class="header-inner">
    <h1>Lagerapp – Del 4</h1>

    <nav class="app-nav" aria-label="Huvudmeny">
      <button class="nav-btn" class:active-nav={activeView === 'products'} on:click={() => showView('products')}>
        📦 Produkter
      </button>
<button class="nav-btn" on:click={openNewProduct}>
  🎁 Ny produkt
</button>
      <button class="nav-btn" class:active-nav={activeView === 'orders'} on:click={() => showView('orders')}>
        🚚 Ordrar
      </button>

      <button class="nav-btn" class:active-nav={activeView === 'gps'} on:click={() => showView('gps')}>
        📍 GPS och karta
      </button>

      <button class="nav-btn" class:active-nav={activeView === 'camera'} on:click={() => showView('camera')}>
        📷 Kamera
      </button>

      <button class="nav-btn" class:active-nav={activeView === 'about'} on:click={() => showView('about')}>
        ℹ️ Om
      </button>
    </nav>
  </div>
</header>

<main>
  {#key activeView}
    <div in:fly={{ x: 18, duration: 180 }} out:fade={{ duration: 120 }}>
      {#if activeView === 'products'}
        <section class="list-frame" aria-labelledby="products-title">
          <h2 id="products-title" class="section-title">Lagerlista</h2>

          <div class="product-grid">
            {#each products as product (product.id)}
              <article class="product-card">
                <div class="product-card-head">
                  <h3>{product.name}</h3>
                  <span class:stock-ok={product.stock >= 100} class:stock-low={product.stock > 0 && product.stock < 100} class:stock-out={product.stock <= 0} class="stock-badge">
                    {product.stock} st
                  </span>
                </div>

                <dl class="product-meta">
                  <div>
                    <dt>ID</dt>
                    <dd>{product.id}</dd>
                  </div>

                  <div>
                    <dt>Plats</dt>
                    <dd>{product.location}</dd>
                  </div>
                </dl>

                <div class="btn-row">
  <button
    class="primary-btn"
    type="button"
    on:click={() => openEditProduct(product)}
  >
    Redigera
  </button>

  <button
    class="danger-btn"
    type="button"
    on:click={() => deleteProduct(product)}
  >
    Ta bort
  </button>
</div>
              </article>
            {/each}
          </div>
        </section>

      {:else if activeView === 'new-product' || activeView === 'edit-product'}
  <section class="card" aria-labelledby="product-form-title">
    <h2 id="product-form-title" class="section-title">
      {activeView === 'edit-product' ? 'Redigera produkt' : 'Ny produkt'}
    </h2>

    <form
      class="form"
      on:submit|preventDefault={saveProduct}
    >
      <label for="product-name">Produktnamn</label>
      <input
        id="product-name"
        type="text"
        bind:value={productForm.name}
        required
        autocomplete="off"
      />

      <label for="product-stock">Lagersaldo</label>
      <input
        id="product-stock"
        type="number"
        min="0"
        step="1"
        bind:value={productForm.stock}
        required
      />

      <label for="product-location">Lagerplats</label>
      <input
        id="product-location"
        type="text"
        bind:value={productForm.location}
        required
        autocomplete="off"
      />

      {#if productFormError}
        <p class="error" role="alert">{productFormError}</p>
      {/if}

      <div class="btn-row">
        <button
          class="primary-btn"
          type="submit"
          disabled={savingProduct}
        >
          {savingProduct
            ? 'Sparar...'
            : activeView === 'edit-product'
              ? 'Spara ändringar'
              : 'Lägg till produkt'}
        </button>

        <button
          class="secondary-btn"
          type="button"
          on:click={() => showView('products')}
          disabled={savingProduct}
        >
          Avbryt
        </button>
      </div>
    </form>
  </section>  
      {:else if activeView === 'orders'}
        <section class="list-frame" aria-labelledby="orders-title">
          <h2 id="orders-title" class="section-title">Ordrar redo att skickas</h2>
          <p>Här visas ordrar med status <strong>Packad (200)</strong>.</p>

          <div class="order-grid">
            {#each orders as order (order.id)}
              <article class="order-card">
                <div class="order-card-header">
                  <h3>Order #{order.id}</h3>
                  <span class="status-badge status-packed">Packad</span>
                </div>

                <div class="order-details">
                  <p><strong>Kund:</strong> {order.customer}</p>
                  <p><strong>Adress:</strong> {order.address}</p>
                  <p><strong>Artiklar:</strong> {order.items} st</p>
                </div>

                <div class="btn-row">
                  <button class="primary-btn" type="button" on:click={() => openOrder(order)}>
                    Visa order
                  </button>

                  <button class="secondary-btn" type="button" on:click={() => showView('gps')}>
                    📍 GPS
                  </button>
                </div>
              </article>
            {/each}
          </div>
        </section>

      {:else if activeView === 'order-details' && selectedOrder}
        <section class="card" aria-labelledby="order-details-title">
          <button class="secondary-btn" type="button" on:click={backToOrders}>
            ← Tillbaka till ordrar
          </button>

          <h2 id="order-details-title" class="section-title">Order #{selectedOrder.id}</h2>

          <div class="order-details">
            <p><strong>Kund:</strong> {selectedOrder.customer}</p>
            <p><strong>Leveransadress:</strong> {selectedOrder.address}</p>
            <p><strong>Status:</strong> Packad (200)</p>
            <p><strong>Antal artiklar:</strong> {selectedOrder.items}</p>
          </div>

          <div class="btn-row">
            <button class="primary-btn" type="button" on:click={() => showView('gps')}>
              📍 Hämta GPS-position
            </button>

            <button class="primary-btn" type="button" on:click={() => showView('camera')}>
              📷 Ta leveransfoto
            </button>
          </div>
        </section>

      {:else if activeView === 'gps'}
        <section class="card" aria-labelledby="gps-title">
          <h2 id="gps-title" class="section-title">GPS och karta</h2>

          <p>
            Tryck på knappen för att be webbläsaren om tillåtelse att hämta din
            aktuella position.
          </p>

          <div class="btn-row">
            <button class="primary-btn" type="button" on:click={getLocation} disabled={gettingLocation}>
              {gettingLocation ? 'Hämtar position...' : '📍 Hämta min position'}
            </button>

            {#if location}
              <button class="secondary-btn" type="button" on:click={openMap}>
                🗺️ Öppna karta
              </button>
            {/if}
          </div>

          {#if location}
            <div class="location-result" transition:fade>
              <p><strong>Din aktuella position är hämtad.</strong></p>

              <div class="coordinates">
                <div class="coordinate">
                  <span>Latitud</span>
                  <strong>{location.latitude.toFixed(6)}</strong>
                </div>

                <div class="coordinate">
                  <span>Longitud</span>
                  <strong>{location.longitude.toFixed(6)}</strong>
                </div>

                <div class="coordinate">
                  <span>Noggrannhet</span>
                  <strong>cirka {location.accuracy} meter</strong>
                </div>
              </div>
            </div>
          {/if}

          {#if locationError}
            <p class="error" role="alert">{locationError}</p>
          {/if}

          <div class="map-container">
            {#if location}
              <div class="map-placeholder">
                <div>
                  <p><strong>Kartan öppnas via knappen ovan.</strong></p>
                  <p>
                    Senare ersätter vi denna ruta med en Leaflet-karta direkt i
                    appen.
                  </p>
                </div>
              </div>
            {:else}
              <div class="map-placeholder">
                <p>Hämta en GPS-position för att kunna öppna platsen på karta.</p>
              </div>
            {/if}
          </div>
        </section>

      {:else if activeView === 'camera'}
        <section class="card" aria-labelledby="camera-title">
          <h2 id="camera-title" class="section-title">Leveransfoto</h2>

          <p>
            På en mobil öppnar knappen normalt enhetens kamera. På dator kan du
            i stället välja en bildfil.
          </p>

          <label class="camera-label" for="camera-input">
            📷 Ta foto eller välj bild
          </label>

          <input
            id="camera-input"
            class="camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            on:change={handleImageChange}
          />

          {#if selectedImageUrl}
            <img
              class="camera-preview"
              src={selectedImageUrl}
              alt="Förhandsgranskning av valt leveransfoto"
              transition:fade
            />
          {/if}
        </section>

      {:else if activeView === 'about'}
        <section class="card" aria-labelledby="about-title">
          <h2 id="about-title" class="section-title">Om lagerappen</h2>

          <p>
            Lagerapp del 4 bygger vidare på föregående del och använder
            funktioner som är särskilt användbara i mobila enheter:
            geolokalisering, karta och kamera.
          </p>

          <p>
            I nästa steg ersätter vi exempeldata med dina riktiga produkter och
            ordrar från del 3.
          </p>
        </section>
      {/if}
    </div>
  {/key}
</main>