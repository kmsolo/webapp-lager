<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy, tick } from 'svelte';
  import { UploadClient } from '@uploadcare/upload-client';
  import { getOrder, updateOrder } from '$lib/api.js';

  let order = $state(null);
  let mapEl;
  let watchId;
  let mounted = true;

  let videoEl;
  let canvasEl;
  let cameraOn = $state(false);
  let photoDataUrl = $state(null);
  let uploading = $state(false);
  let stream;
  let facingMode = $state('environment'); // 'environment' = bak, 'user' = fram

  const uploadClient = new UploadClient({
    publicKey: import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY
  });

  async function geocode(address) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await res.json();
    return data[0];
  }

  onMount(async () => {
    order = await getOrder($page.params.id);
    if (!order) return;

    await tick(); // vänta så mapEl-diven hinner renderas i DOM:en

    const loc = await geocode(order.address);
    if (!loc || !mounted) return;

    const L = await import('leaflet');
    if (!mounted || !mapEl) return;

    const map = L.map(mapEl).setView([loc.lat, loc.lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([loc.lat, loc.lon]).addTo(map).bindPopup('Leveransadress');

    if (navigator.geolocation) {
      let meMarker;
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (meMarker) {
            meMarker.setLatLng([latitude, longitude]);
          } else {
            meMarker = L.circleMarker([latitude, longitude], {
              radius: 8,
              color: '#1e90ff',
              fillColor: '#1e90ff',
              fillOpacity: 0.8
            }).addTo(map).bindPopup('Du är här');
          }
        },
        (err) => console.error('Geolocation-fel:', err),
        { enableHighAccuracy: true }
      );
    }
  });

  onDestroy(() => {
    mounted = false;
    if (watchId) navigator.geolocation.clearWatch(watchId);
    if (stream) stream.getTracks().forEach((t) => t.stop());
  });

  async function startCamera() {
    if (stream) stream.getTracks().forEach((t) => t.stop());

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode }
    });
    videoEl.srcObject = stream;
    cameraOn = true;
  }

  function switchCamera() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera();
  }

  function takePhoto() {
    const ctx = canvasEl.getContext('2d');
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0);
    photoDataUrl = canvasEl.toDataURL('image/jpeg', 0.9);

    stream.getTracks().forEach((t) => t.stop());
    cameraOn = false;
  }

  function retakePhoto() {
    photoDataUrl = null;
    startCamera();
  }

  async function confirmDelivery() {
    uploading = true;
    try {
      const blob = await (await fetch(photoDataUrl)).blob();
      const fileInfo = await uploadClient.uploadFile(blob, { store: 'true' });

      // Be UploadCare om en optimerad JPEG-variant med filändelse,
      // annars blockerar vissa webbläsare (t.ex. Firefox) originalfilens URL.
      const imageUrl = `https://rk8y0f1fzt.ucarecd.net/${fileInfo.uuid}/-/preview/800x800/-/format/jpeg/`;

      await updateOrder(order.id, { status: 400, image_url: imageUrl });
      goto('/levererat');
    } catch (err) {
      console.error('Uppladdning misslyckades:', err);
      alert('Något gick fel vid uppladdningen. Försök igen.');
    } finally {
      uploading = false;
    }
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
</svelte:head>

{#if order}
  <h1>{order.order_number}</h1>
  <p>{order.customer_name}<br>{order.address}</p>
  <div bind:this={mapEl} style="height: 300px; border-radius: 10px;"></div>

  <section class="delivery">
    <h2>Leverans</h2>

    {#if !photoDataUrl}
      <video bind:this={videoEl} autoplay playsinline class:hidden={!cameraOn}></video>

      {#if !cameraOn}
        <button onclick={startCamera}>📷 Öppna kamera</button>
      {:else}
        <div class="button-row">
          <button onclick={takePhoto}>Ta bild</button>
          <button onclick={switchCamera}>🔄 Byt kamera</button>
        </div>
      {/if}
    {:else}
      <img src={photoDataUrl} alt="Foto av levererat paket" />
      <div class="button-row">
        <button onclick={retakePhoto} disabled={uploading}>Ta om</button>
        <button onclick={confirmDelivery} disabled={uploading}>
          {uploading ? 'Laddar upp...' : 'Bekräfta leverans'}
        </button>
      </div>
    {/if}

    <canvas bind:this={canvasEl} style="display:none"></canvas>
  </section>
{:else}
  <p>Order hittades inte.</p>
{/if}

<style>
  .delivery {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }
  video, img {
    width: 100%;
    border-radius: 8px;
    margin: 0.5rem 0;
  }
  video.hidden {
    display: none;
  }
  button {
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 8px;
    background: #f3b1bf;
    cursor: pointer;
    font-weight: bold;
  }
  .button-row {
    display: flex;
    gap: 0.5rem;
  }
</style>
