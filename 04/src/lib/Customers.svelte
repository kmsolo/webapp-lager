<!-- src/lib/Customers.svelte: CRUD för kunder -->
<script>
  import { onMount } from 'svelte'

  export let apiUrl = ''

  let customers = []
  let loading = true

  // Formuläret används både för att skapa och redigera
  let editingId = null
  let name = ''
  let email = ''
  let address = ''

  let error = ''
  let message = ''

  // Visa en kunds ordrar
  let openId = null
  let ordersByCustomer = {}
  let loadingOrders = false

  const statusLabels = { ny: 'Ny', packad: 'Packad', levererad: 'Levererad', fakturerad: 'Fakturerad' }

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

  function resetForm() {
    editingId = null
    name = email = address = ''
  }

  function startEdit(customer) {
    editingId = customer.id
    name = customer.name
    email = customer.email ?? ''
    address = customer.address ?? ''
    error = ''
    message = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function saveCustomer(event) {
    event.preventDefault()
    error = ''
    message = ''
    const isEdit = editingId !== null
    try {
      const res = await fetch(`${apiUrl}/customers${isEdit ? '/' + editingId : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, address }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP-fel: ${res.status}`)
      message = isEdit ? `Kunden ${data.name} uppdaterades.` : `Kunden ${data.name} skapades.`
      resetForm()
      await loadCustomers()
    } catch (e) {
      error = e.message
    }
  }

  async function toggleOrders(customer) {
    if (openId === customer.id) {
      openId = null
      return
    }
    openId = customer.id
    loadingOrders = true
    error = ''
    try {
      const res = await fetch(`${apiUrl}/orders?customer_id=${customer.id}`)
      if (!res.ok) throw new Error(`HTTP-fel: ${res.status}`)
      ordersByCustomer = { ...ordersByCustomer, [customer.id]: await res.json() }
    } catch (e) {
      console.error(e)
      error = 'Kunde inte hämta kundens ordrar.'
    } finally {
      loadingOrders = false
    }
  }

  async function deleteCustomer(customer) {
    if (!window.confirm(`Ta bort kunden ${customer.name}?`)) return
    error = ''
    message = ''
    try {
      const res = await fetch(`${apiUrl}/customers/${customer.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP-fel: ${res.status}`)
      message = `Kunden ${customer.name} togs bort.`
      if (editingId === customer.id) resetForm()
      if (openId === customer.id) openId = null
      await loadCustomers()
    } catch (e) {
      error = e.message
    }
  }
</script>

<section class="card">
  <h2 class="section-title">Kunder</h2>

  <form onsubmit={saveCustomer}>
    <h3>{editingId === null ? 'Ny kund' : 'Redigera kund'}</h3>

    <label for="c-name">Namn</label>
    <input id="c-name" bind:value={name} required />

    <label for="c-email">E-post</label>
    <input id="c-email" type="email" bind:value={email} />

    <label for="c-address">Adress (används som leveransadress)</label>
    <input id="c-address" bind:value={address} placeholder="Gatuadress 1, Stad" />

    <div class="btn-row">
      <button class="primary-btn" type="submit">{editingId === null ? 'Skapa kund' : 'Spara ändringar'}</button>
      {#if editingId !== null}
        <button class="secondary-btn" type="button" onclick={resetForm}>Avbryt</button>
      {/if}
    </div>
  </form>

  {#if message}<p role="status">✅ {message}</p>{/if}
  {#if error}<p style="color: red;">{error}</p>{/if}

  <h3>Alla kunder</h3>
  {#if loading}
    <p>Laddar…</p>
  {:else if customers.length === 0}
    <p>Det finns inga kunder än.</p>
  {:else}
    <ul style="list-style: none; padding: 0; display: grid; gap: 0.75rem;">
      {#each customers as customer (customer.id)}
        <li style="border: 1px solid var(--card-border); border-radius: 8px; padding: 0.75rem;">
          <strong>{customer.name}</strong>
          <div>{customer.email ?? 'ingen e-post'} · {customer.address ?? 'ingen adress'}</div>
          <div>Ordrar: {customer.order_count}</div>
          <div class="btn-row" style="margin-top: 0.5rem;">
            <button class="secondary-btn" type="button" onclick={() => toggleOrders(customer)} disabled={customer.order_count === 0}>
              {openId === customer.id ? '▲ Dölj ordrar' : '📋 Visa ordrar'}
            </button>
            <button class="secondary-btn" type="button" onclick={() => startEdit(customer)}>✏️ Redigera</button>
            <button
              class="danger-btn"
              type="button"
              onclick={() => deleteCustomer(customer)}
              disabled={customer.order_count > 0}
              title={customer.order_count > 0 ? 'Kunden har ordrar och kan inte tas bort' : ''}
            >🗑️ Ta bort</button>
          </div>

          {#if openId === customer.id}
            {#if loadingOrders}
              <p>Laddar ordrar…</p>
            {:else}
              {@const orders = ordersByCustomer[customer.id] ?? []}
              <table style="width: 100%; margin-top: 0.75rem; border-collapse: collapse;">
                <thead>
                  <tr><th align="left">#</th><th align="left">Produkt</th><th align="right">Antal</th><th align="right">Summa</th><th align="left">Status</th><th align="left">Datum</th></tr>
                </thead>
                <tbody>
                  {#each orders as order (order.id)}
                    <tr>
                      <td>{order.id}</td>
                      <td>{order.product_name}</td>
                      <td align="right">{order.quantity}</td>
                      <td align="right">{(order.quantity * order.unit_price).toLocaleString('sv-SE')} kr</td>
                      <td>{statusLabels[order.status] ?? order.status}</td>
                      <td>{order.created_at}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
              <p style="margin-top: 0.5rem;"><strong>Totalt:</strong> {orders.reduce((sum, o) => sum + o.quantity * o.unit_price, 0).toLocaleString('sv-SE')} kr</p>
            {/if}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
