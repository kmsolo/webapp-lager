<!-- src/lib/Customers.svelte: lista och skapa kunder -->
<script>
  import { onMount } from 'svelte'

  export let apiUrl = ''

  let customers = []
  let name = ''
  let email = ''
  let address = ''
  let error = ''
  let message = ''
  let loading = true

  onMount(loadCustomers)

  async function loadCustomers() {
    try {
      const res = await fetch(`${apiUrl}/customers`)
      if (!res.ok) throw new Error(`HTTP-fel: ${res.status}`)
      customers = await res.json()
    } catch (e) {
      console.error(e)
      error = 'Kunde inte hämta kunder.'
    } finally {
      loading = false
    }
  }

  async function saveCustomer(event) {
    event.preventDefault()
    error = ''
    message = ''
    try {
      const res = await fetch(`${apiUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, address }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP-fel: ${res.status}`)
      message = `Kunden ${data.name} skapades.`
      name = email = address = ''
      await loadCustomers()
    } catch (e) {
      error = e.message
    }
  }
</script>

<section class="card">
  <h2 class="section-title">Kunder</h2>

  <form onsubmit={saveCustomer}>
    <label for="c-name">Namn</label>
    <input id="c-name" bind:value={name} required />

    <label for="c-email">E-post</label>
    <input id="c-email" type="email" bind:value={email} />

    <label for="c-address">Adress (används som leveransadress)</label>
    <input id="c-address" bind:value={address} placeholder="Gatuadress 1, Stad" />

    <button class="primary-btn" type="submit">Skapa kund</button>
  </form>

  {#if message}<p role="status">✅ {message}</p>{/if}
  {#if error}<p style="color: red;">{error}</p>{/if}

  <h3>Alla kunder</h3>
  {#if loading}
    <p>Laddar…</p>
  {:else if customers.length === 0}
    <p>Det finns inga kunder än.</p>
  {:else}
    <ul>
      {#each customers as customer (customer.id)}
        <li><strong>{customer.name}</strong> – {customer.address ?? 'ingen adress'}</li>
      {/each}
    </ul>
  {/if}
</section>
