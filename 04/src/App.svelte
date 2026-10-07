<script>
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'

  const apiUrl = 'http://localhost:3001'

  let activeView = 'products'

  let products = []
  let productsError = ''
  let loadingProducts = true

  let productForm = {
    id: null,
    name: '',
    stock: '',
    location: '',
  }

  let productFormError = ''
  let savingProduct = false

  let deliveries = []
  let loadingDeliveries = false
  let deliveriesError = ''

  let deliveryForm = {
    product_id: '',
    amount: '',
    delivery_date: new Date().toISOString().slice(0, 10),
    comment: '',
  }

  let deliveryFormError = ''
  let savingDelivery = false

  let selectedOrder = null

  let location = null
  let locationError = ''
  let gettingLocation = false

  let selectedImageUrl = ''

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

  onMount(() => {
    loadProducts()
  })

  function showView(view) {
    activeView = view
    selectedOrder = null
  }

  async function loadProducts() {
    loadingProducts = true
    productsError = ''

    try {
      const response = await fetch(`${apiUrl}/products`)

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

  function resetProductForm() {
    productForm = {
      id: null,
      name: '',
      stock: '',
      location: '',
    }

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

    productFormError = ''
    activeView = 'edit-product'
  }

  async function saveProduct() {
    productFormError = ''

    const name = productForm.name.trim()
    const locationName = productForm.location.trim()
    const stock = Number(productForm.stock)

    if (!name || !locationName || !Number.isFinite(stock) || stock < 0) {
      productFormError =
        'Fyll i produktnamn, lagerplats och ett lagersaldo som är noll eller större.'
      return
    }

    savingProduct = true

    try {
      const isEdit = productForm.id !== null
      const url = isEdit
        ? `${apiUrl}/products/${productForm.id}`
        : `${apiUrl}/products`

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          stock,
          location: locationName,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`)
      }

      await loadProducts()
      resetProductForm()
      activeView = 'products'
    } catch (error) {
      console.error('Kunde inte spara produkt:', error)
      productFormError =
        'Kunde inte spara produkten. Kontrollera att API-servern körs.'
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
      const response = await fetch(`${apiUrl}/products/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`)
      }

      await loadProducts()
    } catch (error) {
      console.error('Kunde inte ta bort produkt:', error)
      productsError =
        'Kunde inte ta bort produkten. Kontrollera att API-servern körs.'
    }
  }

  async function loadDeliveries() {
    loadingDeliveries = true
    deliveriesError = ''

    try {
      const response = await fetch(`${apiUrl}/deliveries`)

      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`)
      }

      deliveries = await response.json()
    } catch (error) {
      console.error('Kunde inte hämta inleveranser:', error)
      deliveriesError =
        'Kunde inte hämta inleveranser. Kontrollera att API-servern körs.'
    } finally {
      loadingDeliveries = false
    }
  }

  function openDeliveries() {
    activeView = 'deliveries'
    loadDeliveries()
  }

  function openNewDelivery() {
    deliveryForm = {
      product_id: '',
      amount: '',
      delivery_date: new Date().toISOString().slice(0, 10),
      comment: '',
    }

    deliveryFormError = ''
    activeView = 'new-delivery'
  }

  async function saveDelivery() {
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
      const response = await fetch(`${apiUrl}/deliveries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          amount,
          delivery_date: deliveryForm.delivery_date,
          comment: deliveryForm.comment.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`)
      }

      await loadProducts()
      await loadDeliveries()

      activeView = 'deliveries'
    } catch (error) {
      console.error('Kunde inte spara inleveransen:', error)
      deliveryFormError =
        'Kunde inte spara inleveransen. Kontrollera att API-servern körs.'
    } finally {
      savingDelivery = false
    }
  }

  function openOrder(order) {
    selectedOrder = order
    activeView = 'order-details'
  }

  function backToOrders() {
    selectedOrder = null
    activeView = 'orders'
  }

  function getLocation() {
    locationError = ''
    location = null

    if (!navigator.geolocation) {
      locationError = 'Din webbläsare har inte stöd för GPS-positionering.'
      return
    }

    gettingLocation = true

    navigator.geolocation.getCurrentPosition(
      (position) => {
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        }

        gettingLocation = false
      },
      (error) => {
        const messages = {
          1: 'Du nekade tillåtelse att använda positionen.',
          2: 'Det gick inte att fastställa positionen.',
          3: 'Tidsgränsen för att hämta positionen gick ut.',
        }

        locationError =
          messages[error.code] ??
          'Ett okänt fel uppstod när positionen skulle hämtas.'

        gettingLocation = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  function openMap() {
    if (!location) {
      return
    }

    const { latitude, longitude } = location
    const url =
      `https://www.openstreetmap.org/?mlat=${latitude}` +
      `&mlon=${longitude}#map=16/${latitude}/${longitude}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleImageChange(event) {
    const image = event.currentTarget.files?.[0]

    if (!image) {
      return
    }

    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl)
    }

    selectedImageUrl = URL.createObjectURL(image)
  }
</script>

<svelte:head>
  <title>Lagerapp – Del 4</title>
  <meta
    name="description"
    content="Lagerapp med produkter, inleveranser, ordrar, GPS och kamera."
  />
</svelte:head>

<header class="topbar">
  <div class="header-inner">
    <h1>Lagerapp – Del 4</h1>

    <nav class="app-nav" aria-label="Huvudmeny">
      <button
        class="nav-btn"
        class:active-nav={activeView === 'products'}
        type="button"
        on:click={() => showView('products')}
      >
        📦 Produkter
      </button>

      <button class="nav-btn" type="button" on:click={openNewProduct}>
        🎁 Ny produkt
      </button>

      <button
        class="nav-btn"
        class:active-nav={activeView === 'deliveries'}
        type="button"
        on:click={openDeliveries}
      >
        📥 Inleveranser
      </button>

      <button class="nav-btn" type="button" on:click={openNewDelivery}>
        ➕ Ny inleverans
      </button>

      <button
        class="nav-btn"
        class:active-nav={activeView === 'orders'}
        type="button"
        on:click={() => showView('orders')}
      >
        🚚 Ordrar
      </button>

      <button
        class="nav-btn"
        class:active-nav={activeView === 'gps'}
        type="button"
        on:click={() => showView('gps')}
      >
        📍 GPS och karta
      </button>

      <button
        class="nav-btn"
        class:active-nav={activeView === 'camera'}
        type="button"
        on:click={() => showView('camera')}
      >
        📷 Kamera
      </button>

      <button
        class="nav-btn"
        class:active-nav={activeView === 'about'}
        type="button"
        on:click={() => showView('about')}
      >
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

          {#if loadingProducts}
            <p>Laddar produkter från lager.sqlite...</p>
          {:else if productsError}
            <p class="error" role="alert">{productsError}</p>
          {:else if products.length === 0}
            <p>Det finns inga produkter i databasen.</p>
          {:else}
            <div class="product-grid">
              {#each products as product (product.id)}
                <article class="product-card">
                  <div class="product-card-head">
                    <h3>{product.name}</h3>

                    <span
                      class="stock-badge"
                      class:stock-ok={product.stock >= 100}
                      class:stock-low={product.stock > 0 && product.stock < 100}
                      class:stock-out={product.stock <= 0}
                    >
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
          {/if}
        </section>

      {:else if activeView === 'new-product' || activeView === 'edit-product'}
        <section class="card" aria-labelledby="product-form-title">
          <h2 id="product-form-title" class="section-title">
            {activeView === 'edit-product' ? 'Redigera produkt' : 'Ny produkt'}
          </h2>

          <form class="form" on:submit|preventDefault={saveProduct}>
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

      {:else if activeView === 'deliveries'}
        <section class="list-frame" aria-labelledby="deliveries-title">
          <h2 id="deliveries-title" class="section-title">Inleveranser</h2>

          {#if loadingDeliveries}
            <p>Laddar inleveranser från lager.sqlite...</p>
          {:else if deliveriesError}
            <p class="error" role="alert">{deliveriesError}</p>
          {:else if deliveries.length === 0}
            <p>Det finns ännu inga registrerade inleveranser.</p>
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
            <button
              class="primary-btn"
              type="button"
              on:click={openNewDelivery}
            >
              ➕ Registrera ny inleverans
            </button>
          </div>
        </section>

      {:else if activeView === 'new-delivery'}
        <section class="card" aria-labelledby="new-delivery-title">
          <h2 id="new-delivery-title" class="section-title">Ny inleverans</h2>

          <form class="form" on:submit|preventDefault={saveDelivery}>
            <label for="delivery-product">Produkt</label>
            <select
              id="delivery-product"
              bind:value={deliveryForm.product_id}
              required
            >
              <option value="">Välj produkt</option>

              {#each products as product (product.id)}
                <option value={product.id}>
                  {product.name} — nuvarande saldo: {product.stock} st
                </option>
              {/each}
            </select>

            <label for="delivery-amount">Antal</label>
            <input
              id="delivery-amount"
              type="number"
              min="1"
              step="1"
              bind:value={deliveryForm.amount}
              required
            />

            <label for="delivery-date">Leveransdatum</label>
            <input
              id="delivery-date"
              type="date"
              bind:value={deliveryForm.delivery_date}
              required
            />

            <label for="delivery-comment">Kommentar (valfri)</label>
            <input
              id="delivery-comment"
              type="text"
              bind:value={deliveryForm.comment}
              placeholder="Till exempel leverantör eller följesedel"
            />

            {#if deliveryFormError}
              <p class="error" role="alert">{deliveryFormError}</p>
            {/if}

            <div class="btn-row">
              <button
                class="primary-btn"
                type="submit"
                disabled={savingDelivery}
              >
                {savingDelivery ? 'Sparar...' : 'Spara inleverans'}
              </button>

              <button
                class="secondary-btn"
                type="button"
                on:click={openDeliveries}
                disabled={savingDelivery}
              >
                Avbryt
              </button>
            </div>
          </form>
        </section>

      {:else if activeView === 'orders'}
        <section class="list-frame" aria-labelledby="orders-title">
          <h2 id="orders-title" class="section-title">
            Ordrar redo att skickas
          </h2>

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
                  <button
                    class="primary-btn"
                    type="button"
                    on:click={() => openOrder(order)}
                  >
                    Visa order
                  </button>

                  <button
                    class="secondary-btn"
                    type="button"
                    on:click={() => showView('gps')}
                  >
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

          <h2 id="order-details-title" class="section-title">
            Order #{selectedOrder.id}
          </h2>

          <div class="order-details">
            <p><strong>Kund:</strong> {selectedOrder.customer}</p>
            <p><strong>Leveransadress:</strong> {selectedOrder.address}</p>
            <p><strong>Status:</strong> Packad (200)</p>
            <p><strong>Antal artiklar:</strong> {selectedOrder.items}</p>
          </div>

          <div class="btn-row">
            <button
              class="primary-btn"
              type="button"
              on:click={() => showView('gps')}
            >
              📍 Hämta GPS-position
            </button>

            <button
              class="primary-btn"
              type="button"
              on:click={() => showView('camera')}
            >
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
            <button
              class="primary-btn"
              type="button"
              on:click={getLocation}
              disabled={gettingLocation}
            >
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
            <div class="map-placeholder">
              {#if location}
                <div>
                  <p><strong>Positionen är klar.</strong></p>
                  <p>Öppna kartan med knappen ovan.</p>
                </div>
              {:else}
                <p>Hämta en GPS-position för att kunna öppna platsen på karta.</p>
              {/if}
            </div>
          </div>
        </section>

      {:else if activeView === 'camera'}
        <section class="card" aria-labelledby="camera-title">
          <h2 id="camera-title" class="section-title">Leveransfoto</h2>

          <p>
            På mobil öppnar knappen normalt enhetens kamera. På dator kan du
            välja en bildfil.
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
            Lagerapp del 4 bygger vidare på den tidigare lagerappen och använder
            mobila funktioner: GPS, karta och kamera.
          </p>

          <p>
            Produkter och inleveranser hämtas lokalt från Express och
            <code>lager.sqlite</code>.
          </p>
        </section>
      {/if}
    </div>
  {/key}
</main>