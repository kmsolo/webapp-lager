<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { fetchStationsMap, fetchDelayedTrains, joinTrainsWithStations } from '$lib/api.js';

  let trains = $state([]);
  let loading = $state(true);
  let errorMessage = $state('');

  async function loadData() {
    loading = true;
    errorMessage = '';

    try {
      const [stationsMap, delayedTrains] = await Promise.all([
        fetchStationsMap(),
        fetchDelayedTrains()
      ]);

      const joined = joinTrainsWithStations(delayedTrains, stationsMap);

      // Sortera på längst försening först, inställda tåg högst upp
      joined.sort((a, b) => {
        if (a.canceled !== b.canceled) return a.canceled ? -1 : 1;
        return b.delayMinutes - a.delayMinutes;
      });

      trains = joined;
    } catch (err) {
      console.error('Kunde inte hämta trafikdata:', err);
      errorMessage = 'Kunde inte hämta trafikdata just nu. Kontrollera din uppkoppling.';
    } finally {
      loading = false;
    }
  }

  onMount(loadData);

  function formatTime(isoString) {
    if (!isoString) return '–';
    return new Date(isoString).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  }
</script>

<h1>Försenade tåg</h1>

{#if loading}
  <p in:fade>Laddar trafikdata...</p>
{:else if errorMessage}
  <p class="error" in:fade>{errorMessage}</p>
  <button onclick={loadData}>Försök igen</button>
{:else if trains.length === 0}
  <p in:fade>Inga försenade tåg just nu. 🎉</p>
{:else}
  <ul>
    {#each trains as train, i (train.activityId)}
      <li class:canceled={train.canceled} in:fly={{ y: 10, duration: 150, delay: i * 20 }}>
        <div class="row-top">
          <strong>Tåg {train.trainIdent}</strong>
          {#if train.canceled}
            <span class="badge badge-canceled">Inställt</span>
          {:else}
            <span class="badge badge-delay">+{train.delayMinutes} min</span>
          {/if}
        </div>
        <div class="row-station">{train.stationName}</div>
        <div class="row-route">
          {train.fromLocation} → {train.toLocation}
        </div>
        <div class="row-times">
          Planerad: {formatTime(train.advertisedTime)} · Beräknad: {formatTime(train.estimatedTime)}
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1 { margin-bottom: 1rem; }
  ul { list-style: none; padding: 0; }
  li {
    background: #fff;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    border-left: 4px solid #f3b1bf;
  }
  li.canceled {
    border-left-color: #d9534f;
    background: #fff5f5;
  }
  .row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .badge {
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-weight: bold;
  }
  .badge-delay {
    background: #ffe08a;
    color: #5a4300;
  }
  .badge-canceled {
    background: #d9534f;
    color: white;
  }
  .row-station {
    font-weight: bold;
    margin-top: 0.25rem;
  }
  .row-route {
    color: #555;
    font-size: 0.9rem;
  }
  .row-times {
    font-size: 0.8rem;
    color: #777;
    margin-top: 0.25rem;
  }
  .error { color: #d9534f; }
  button {
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 8px;
    background: #f3b1bf;
    cursor: pointer;
    font-weight: bold;
  }
</style>
