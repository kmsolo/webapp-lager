<script>
  import { fade, fly } from 'svelte/transition'

  let activeView = 'products'
  let location = null
  let locationError = ''
  let gettingLocation = false
  let selectedImageUrl = ''
  let selectedOrder = null

  const products = [
    { id: 1, name: 'Hammare', stock: 750, location: 'A1' },
    { id: 2, name: 'Skor Svarta Strl 45', stock: 260, location: 'S-S 45' },
    { id: 3, name: 'Borrmaskin Edix 250', stock: 100, location: 'B-E-10' },
    { id: 4, name: 'Mutter M 14', stock: 5000, location: 'M-a-10' },
    { id: 5, name: 'Skruv M10', stock: 500, location: 'M-A10' },
    { id: 6, name: 'Skruv M8', stock: 500, location: 'M-A08' },
    { id: 7, name: 'Mutter M 6', stock: 500, location: 'M-A06' },
    { id: 8, name: 'Mutter M 12', stock: 300, location: 'M-A12' },
    { id: 9, name: 'Skruv M08', stock: 655, location: 'S-M08' },
  ]

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

  function showView(view) {
    activeView = view
    selectedOrder = null
  }

  function getStockClass(stock) {
    if (stock <= 0) return 'stock-out'
    if (stock < 100) return 'stock-low'
    return 'stock-ok'
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
        const errors = {
          1: 'Du nekade tillåtelse att använda positionen.',
          2: 'Det gick inte att fastställa positionen.',
          3: 'Tidsgränsen för att hämta positionen gick ut.',
        }

        locationError = errors[error.code] ?? 'Ett okänt fel uppstod vid GPS-hämtning.'
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
    const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`

    window.open(mapUrl, '_blank', 'noopener,noreferrer')
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

  function openOrder(order) {
    selectedOrder = order
    activeView = 'order-details'
  }

  function backToOrders() {
    selectedOrder = null
    activeView = 'orders'
  }
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
                  <button class="primary-btn" type="button">Redigera</button>
                  <button class="danger-btn" type="button">Ta bort</button>
                </div>
              </article>
            {/each}
          </div>
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