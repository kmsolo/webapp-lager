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

<h1>Vilka tåg är försenade?</h1>

{#if loading}
  <p in:fade>Laddar trafikdata...</p>
{:else if errorMessage}
  <p class="error" in:fade>{errorMessage}</p>
  <button onclick={loadData}>Försök igen</button>
{:else if trains.length === 0}
  <p in:fade>Inga försenade tåg just nu. 🎉</p>
{:else}
  <div class="date-pill">Idag, {new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}</div>

  <ul>
    {#each trains as train, i (train.activityId)}
      <li in:fly={{ y: 10, duration: 150, delay: i * 20 }}>
        <div class="row-top">
          {#if train.canceled}
            <span class="badge badge-canceled">INSTÄLLT</span>
          {:else}
            <div class="time-block">
              <span class="time-original">{formatTime(train.advertisedTime)}</span>
              <span class="arrow">→</span>
              <span class="time-new">{formatTime(train.estimatedTime)}</span>
            </div>
          {/if}
          <strong class="train-ident">Tåg {train.trainIdent}</strong>
        </div>
        <div class="row-station">{train.stationName}</div>
        <div class="row-route">{train.fromLocation} → {train.toLocation}</div>
        <div class="row-badges">
          <span class="pill pill-owner">🚆 {train.trainOwner || 'Tåg'}</span>
          {#if !train.canceled}
            <span class="pill pill-delay">+{train.delayMinutes} min</span>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1 { font-size: 1.6rem; margin-bottom: 1rem; }

  .date-pill {
    border: 1px solid #7a1f2c;
    border-radius: 999px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    color: #7a1f2c;
    text-align: center;
    margin-bottom: 1rem;
    text-transform: capitalize;
  }

  ul { list-style: none; padding: 0; }

  li {
    background: white;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
  }

  .time-block {
    font-size: 1.1rem;
    font-weight: bold;
  }
  .time-original {
    text-decoration: line-through;
    color: #999;
    font-weight: normal;
    font-size: 0.9rem;
  }
  .arrow { color: #999; margin: 0 0.3rem; }
  .time-new {
    background: #fff3cd;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
  }

  .train-ident {
    color: #555;
    font-size: 0.85rem;
  }

  .badge {
    display: inline-block;
    text-transform: uppercase;
    font-size: 0.7rem;
    font-weight: bold;
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
  }
  .badge-canceled {
    background: #e2001a;
    color: white;
  }

  .row-station {
    font-weight: bold;
    color: #2b1114;
  }
  .row-route {
    color: #666;
    font-size: 0.9rem;
    margin-top: 0.15rem;
  }

  .row-badges {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.6rem;
  }
  .pill {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
  }
  .pill-owner {
    background: #f0ece9;
    color: #555;
  }
  .pill-delay {
    background: #7a1f2c;
    color: white;
  }

  .error { color: #e2001a; }
  button {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 999px;
    background: #7a1f2c;
    color: white;
    cursor: pointer;
    font-weight: bold;
  }
</style>
