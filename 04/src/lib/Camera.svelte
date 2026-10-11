<!-- src/lib/Camera.svelte -->
<script>
  import { onDestroy } from 'svelte'
  import { UploadClient } from '@uploadcare/upload-client'

  export let onsaved = null

  // Public key från app.uploadcare.com → API keys
  const client = new UploadClient({
  publicKey: '7bc63c3973c07360be62',
  cdnBase: 'https://rk8y0f1fzt.ucarecd.net/',
})
  

  let video, canvas, stream
  let cameraOn = false
  let hasPhoto = false
  let uploading = false
  let imageUrl = ''
  let error = ''

  async function startCamera() {
    error = ''
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      video.srcObject = stream
      await video.play()
      cameraOn = true
    } catch (e) {
      error = 'Kunde inte starta kameran: ' + e.message
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((t) => t.stop())
    cameraOn = false
  }

  function takePhoto() {
    const width = 640
    const height = video.videoHeight / (video.videoWidth / width)
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(video, 0, 0, width, height)
    hasPhoto = true
  }

  async function sendPhoto() {
    uploading = true
    error = ''
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
      const fileInfo = await client.uploadFile(blob, { fileName: 'leverans.jpg', contentType: 'image/jpeg' })
      imageUrl = fileInfo.cdnUrl
      onsaved?.(imageUrl)
      stopCamera()
    } catch (e) {
      console.error('Uppladdning misslyckades:', e)
      error = 'Kunde inte ladda upp bilden. Försök igen.'
    } finally {
      uploading = false
    }
  }

  onDestroy(stopCamera)
</script>

<div class="camera">
  <strong>📷 Leveransfoto</strong>

  <video bind:this={video} playsinline muted style="width: 100%; max-width: 400px;" hidden={!cameraOn}></video>
  <canvas bind:this={canvas} style="width: 100%; max-width: 400px;" hidden={!hasPhoto}></canvas>

  <div class="btn-row">
    {#if !cameraOn}
      <button class="primary-btn" type="button" onclick={startCamera}>Starta kamera</button>
    {:else}
      <button class="primary-btn" type="button" onclick={takePhoto}>Ta foto</button>
    {/if}
    {#if hasPhoto}
      <button class="primary-btn" type="button" onclick={sendPhoto} disabled={uploading}>Skicka foto</button>
    {/if}
  </div>

  {#if uploading}<p>🔄 Laddar upp…</p>{/if}
  {#if error}<p style="color: red;">{error}</p>{/if}
  {#if imageUrl}<p>✅ Bild uppladdad</p>{/if}
</div>