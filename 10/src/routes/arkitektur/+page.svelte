<h1>Arkitektur och tekniska val</h1>

<section>
  <h2>Teknikval</h2>
  <p>
    Appen är byggd med <strong>SvelteKit</strong> och byggverktyget <strong>Vite</strong>, samma
    stack som använts genom hela kursen. Jag valde att fortsätta med Svelte eftersom jag redan
    investerat tid i att lära mig ramverket under kmom04–06, och dess inbyggda reaktivitetssystem
    (<code>$state</code>) och övergångar (<code>svelte/transition</code>) gör det enkelt att bygga
    ett responsivt gränssnitt utan extra bibliotek.
  </p>
  <p>
    Datan hämtas från <strong>Trafik-API:t</strong> (trafik.emilfolino.se), som exponerar två
    REST-endpoints (<code>/stations</code> och <code>/delayed</code>) samt en
    <strong>socket.io</strong>-anslutning för tågens live-positioner. Jag återanvänder
    socket.io-kunskapen från kmom05 för att visa tågens position på kartan i realtid.
  </p>
  <p>
    Kartan renderas med <strong>Leaflet</strong>, ett lätt och gratis kartbibliotek utan
    API-nyckelkrav. Appen är byggd som en <strong>PWA</strong> med hjälp av
    <code>vite-plugin-pwa</code>, vilket ger installerbarhet och offline-stöd genom en Service
    Worker (Workbox). Driftsättning sker via <strong>GitHub Actions</strong>, som bygger appen med
    Vite och publicerar den till GitHub Pages.
  </p>
</section>

<section>
  <h2>Kodstruktur</h2>
  <p>Koden är organiserad enligt SvelteKits konventioner:</p>
  <ul>
    <li>
      <code>src/lib/api.js</code> — all kommunikation med Trafik-API:t: hämtning av stationer och
      förseningar, samt logiken som kopplar ihop datamängderna via <code>LocationSignature</code>
      och beräknar förseningstid.
    </li>
    <li><code>src/routes/+page.svelte</code> — startsidan som listar försenade tåg.</li>
    <li><code>src/routes/karta/+page.svelte</code> — kartvyn med live-positioner.</li>
    <li><code>src/routes/+layout.svelte</code> — gemensam layout, navigering, offline-indikator.</li>
  </ul>
  <p>
    All extern data går genom <code>lib/api.js</code>, medan varje <code>routes</code>-mapp
    motsvarar en tydligt avgränsad vy — en kollega kan snabbt hitta rätt utan att läsa igenom hela
    kodbasen.
  </p>
</section>

<section>
  <h2>Cachning</h2>
  <p>
    <strong>Stationsdatan</strong> (<code>/stations</code>) cachas aggressivt med en
    <code>CacheFirst</code>-strategi, eftersom stationer och koordinater sällan förändras.
    <strong>Förseningsdatan</strong> (<code>/delayed</code>) cachas istället med
    <code>NetworkFirst</code>, eftersom den ändras kontinuerligt — användaren ska få så färsk data
    som möjligt när uppkoppling finns, men appen ska ändå fungera med senast kända data offline.
  </p>
</section>

<section>
  <h2>Prioriteringar</h2>
  <p>
    <!-- TODO: fyll i när appen är klar -->
    Skriv här om du hann med allt du planerade, eller fick välja bort något (t.ex. sökfunktion,
    fler kartlager) på grund av tidsbrist.
  </p>
</section>

<section>
  <h2>Kritik av lösningen</h2>
  <p>
    <!-- TODO: fyll i sist -->
    Var ärlig kring begränsningar: t.ex. ingen sökfunktion för specifika stationer/tåg, ingen
    hantering av längre API-nedtid utöver ett generellt felmeddelande, ingen automatisk
    omhämtning av data med jämna mellanrum.
  </p>
</section>

<section>
  <h2>Möjliga förbättringar</h2>
  <p>
    <!-- TODO: fyll i sist -->
    Konkreta, tidsbegränsade förbättringar: t.ex. sökfält för att filtrera på stationsnamn,
    polling var 60:e sekund för auto-uppdatering, favoritstationer i local storage.
  </p>
</section>

<style>
  h1 { color: #7a1f2c; font-family: Georgia, serif; }
  h2 { color: #7a1f2c; font-size: 1.2rem; margin-top: 1.5rem; }
  section { margin-bottom: 1rem; }
  p, li { line-height: 1.6; color: #2b1114; }
  code {
    background: #f0ece9;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
</style>