<!-- src/lib/Products.svelte -->
<script>
  import { createEventDispatcher } from 'svelte'

  export let products = []
  export let apiUrl = ''

  const dispatch = createEventDispatcher()

  function openEditProduct(product) {
    dispatch('editProduct', product)
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(`Vill du verkligen ta bort "${product.name}"?`)
    if (!confirmed) return

    try {
      const response = await fetch(`${apiUrl}/products/${product.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`)
      dispatch('deleteProduct', product)
    } catch (error) {
      console.error('Kunde inte ta bort produkt:', error)
      alert('Kunde inte ta bort produkten.')
    }
  }
</script>

<section class="list-frame" aria-labelledby="products-title">
  <h2 id="products-title" class="section-title">Lagerlista</h2>

  {#if products.length === 0}
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
            <div><dt>ID</dt><dd>{product.id}</dd></div>
            <div><dt>Plats</dt><dd>{product.location}</dd></div>
          </dl>

          <div class="btn-row">
            <button class="primary-btn" type="button" onclick={() => openEditProduct(product)}>
              Redigera
            </button>
            <button class="danger-btn" type="button" onclick={() => deleteProduct(product)}>
              Ta bort
            </button>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</section>