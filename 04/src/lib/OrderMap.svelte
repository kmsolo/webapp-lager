<!-- Karta: leveransadress (Nominatim) + live-GPS-position -->
<script>
  import { onMount } from 'svelte'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import markerIcon from 'leaflet/dist/images/marker-icon.png'
  import markerShadow from 'leaflet/dist/images/marker-shadow.png'

  export let address = ''
  export let onposition = null

  let el
  let status = 'Hämtar position…'
  let addressError = ''

  onMount(() => {
    const icon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] })
    const map = L.map(el).setView([62, 15], 4)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)

    let destMarker = null
    let meMarker = null
    let watchId = null

    function fit() {
      const pts = [destMarker?.getLatLng(), meMarker?.getLatLng()].filter(Boolean)
      if (pts.length === 2) map.fitBounds(L.latLngBounds(pts), { padding: [30, 30] })
      else if (pts.length === 1) map.setView(pts[0], 15)
    }

    async function geocode() {
      if (!address) { addressError = 'Ordern saknar adress.'; return }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
        )
        const [hit] = await res.json()
        if (!hit) { addressError = 'Adressen hittades inte på kartan.'; return }
        destMarker = L.marker([+hit.lat, +hit.lon], { icon }).addTo(map).bindPopup(`Leverans: ${address}`)
        fit()
      } catch {
        addressError = 'Kunde inte slå upp adressen (offline?).'
      }
    }

    function startGps() {
      if (!navigator.geolocation) { status = 'GPS stöds inte i den här webbläsaren.'; return }
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords
          const ll = [latitude, longitude]
          if (meMarker) meMarker.setLatLng(ll)
          else {
            meMarker = L.circleMarker(ll, { radius: 8, color: '#1d4ed8', fillOpacity: 0.8 }).addTo(map).bindPopup('Din position')
            fit()
          }
          status = `Position hittad (±${Math.round(accuracy)} m)`
          onposition?.({ latitude, longitude, accuracy })
        },
        (err) => {
          status = { 1: 'Du nekade positionstillstånd.', 2: 'Positionen kunde inte fastställas.', 3: 'Positionering tog för lång tid.' }[err.code] ?? 'GPS-fel.'
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
      )
    }

    geocode()
    startGps()

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      map.remove()
    }
  })
</script>

<div bind:this={el} class="map" aria-label="Karta med leveransadress och din position"></div>
<p class="map-status">📍 {status}</p>
{#if addressError}<p class="error">⚠️ {addressError}</p>{/if}
