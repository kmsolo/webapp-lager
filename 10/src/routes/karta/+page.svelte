<script>
  import { onMount, onDestroy } from 'svelte';
  import { io } from 'socket.io-client';
  import { fetchStationsMap, fetchDelayedTrains, joinTrainsWithStations } from '$lib/api.js';

  let mapEl;
  let map;
  let loading = $state(true);
  let errorMessage = $state('');
  let liveCount = $state(0);

  const stationMarkers = new Map(); // trainIdent -> Leaflet marker (senast kända station)
  const liveMarkers = new Map(); // trainIdent -> Leaflet marker (live-position)

  let socket;

  onMount(async () => {
    try {
      const L = await import('leaflet');

      map = L.map(mapEl).setView([62.0, 15.0], 5); // Ungefärligt mittpunkt Sverige
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      const [stationsMap, delayedTrains] = await Promise.all([
        fetchStationsMap(),
        fetchDelayedTrains()
      ]);

      const trains = joinTrainsWithStations(delayedTrains, stationsMap);

      for (const train of trains) {
        if (train.lat === null || train.lon === null) continue; // Hoppa över tåg utan känd position

        const marker = L.circleMarker([train.lat, train.lon], {
          radius: 6,
          color: train.canceled ? '#d9534f' : '#f3b1bf',
          fillColor: train.canceled ? '#d9534f' : '#f3b1bf',
          fillOpacity: 0.7
        }).addTo(map);

        marker.bindPopup(
          `<strong>Tåg ${train.trainIdent}</strong><br>${train.stationName}<br>${
            train.canceled ? 'Inställt' : `+${train.delayMinutes} min försenat`
          }`
        );

        stationMarkers.set(train.trainIdent, marker);
      }

      connectLivePositions(L);
    } catch (err) {
      console.error('Kunde inte ladda karta/trafikdata:', err);
      errorMessage = 'Kunde inte ladda kartdata just nu.';
    } finally {
      loading = false;
    }
  });

  function connectLivePositions(L) {
    socket = io('https://trafik.emilfolino.se');

    socket.on('position', (data) => {
      // Robust felhantering: ignorera ogiltig data istället för att krascha
      if (!data || typeof data.train !== 'string' || !Array.isArray(data.position)) return;

      const [lat, lon] = data.position;
      if (typeof lat !== 'number' || typeof lon !== 'number') return;

      let marker = liveMarkers.get(data.train);

      if (marker) {
        marker.setLatLng([lat, lon]);
      } else {
        marker = L.circleMarker([lat, lon], {
          radius: 8,
          color: '#1e90ff',
          fillColor: '#1e90ff',
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`<strong>Tåg ${data.train}</strong><br>Live-position`);
        liveMarkers.set(data.train, marker);
        liveCount = liveMarkers.size;
      }
    });
  }

  onDestroy(() => {
    if (socket) socket.disconnect();
  });
</script>

<h1>Karta över försenade tåg</h1>

{#if loading}
  <p>Laddar karta...</p>
{:else if errorMessage}
  <p class="error">{errorMessage}</p>
{/if}

<p class="legend">
  <span class="dot pink"></span> Senast kända station
  <span class="dot red"></span> Inställt
  <span class="dot blue"></span> Live-position ({liveCount} tåg spåras just nu)
</p>

<div bind:this={mapEl} class="map"></div>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
</svelte:head>

<style>
  .map {
    height: 70vh;
    border-radius: 10px;
  }
  .legend {
    font-size: 0.85rem;
    color: #555;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
  }
  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 0.2rem;
  }
  .pink { background: #f3b1bf; }
  .red { background: #d9534f; }
  .blue { background: #1e90ff; }
  .error { color: #d9534f; }
</style>