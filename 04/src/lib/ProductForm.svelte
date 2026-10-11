<!-- src/lib/ProductForm.svelte -->
<script>
  import { createEventDispatcher } from 'svelte'

  export let apiUrl = ''
  export let mode = 'create' // 'create' eller 'edit'
  export let product = null

  const dispatch = createEventDispatcher()

  let productForm = {
    id: null,
    name: '',
    stock: '',
    location: '',
  }

  let productFormError = ''
  let savingProduct = false

  if (mode === 'edit' && product) {
    productForm = {
      id: product.id,
      name: product.name,
      stock: String(product.stock),
      location: product.location,
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
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

      dispatch('saved')
    } catch (error) {
      console.error('Kunde inte spara produkt:', error)
      productFormError =
        'Kunde inte spara produkten. Kontrollera att API-servern körs.'
    } finally {
      savingProduct = false
    }
  }

  function cancel() {
    dispatch('cancel')
  }
</script>

<section class="card" aria-labelledby="product-form-title">
  <h2 id="product-form-title" class="section-title">
    {mode === 'edit' ? 'Redigera produkt' : 'Ny produkt'}
  </h2>

  <form class="form" onsubmit={saveProduct}>
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
          : mode === 'edit'
            ? 'Spara ändringar'
            : 'Lägg till produkt'}
      </button>

      <button
        class="secondary-btn"
        type="button"
        onclick={cancel}
        disabled={savingProduct}
      >
        Avbryt
      </button>
    </div>
  </form>
</section>