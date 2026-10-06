import { escapeHtml } from "../utils/escape-html.js";

const TOPICS = [
  {
    title: "HTML5, CSS3 och JavaScript med mobilt fokus",
    text: `Grunden är semantisk HTML5 (header, nav, main, table och formulär med label) och inputtyper som email, number och date, som ger rätt tangentbord på mobilen. CSS3 sköter layouten med flexbox och media queries. JavaScript körs som ES-moduler med egna web components och en liten hash-router, helt utan ramverk.`,
    app: `Varje vy är en egen komponent, till exempel invoice-list och order-form.`,
  },
  {
    title: "CSS3 för att se ut som en native app",
    text: `Känslan av en native app kommer av stora tryckytor (minst cirka 44 px), tydlig återkoppling vid tryck, systemets typsnitt och att man inte är beroende av hover. Med viewport-fit=cover och env(safe-area-inset-*) hålls innehållet undan från notchar och systemfält. Ett web app manifest med display: standalone gör att appen kan startas utan webbläsarens adressfält.`,
    app: `Fakturorna visas som kort på mobilen, ungefär som listor i en native app, och som tabell först på bredare skärmar.`,
  },
  {
    title: "Mobilen och läsplattan som test- och utvecklingsmiljö",
    text: `Enhetsläget i webbläsarens DevTools räcker för snabba tester av storlek, men vissa saker syns bara på en riktig enhet: touch, mjukvarutangentbord, prestanda och hur adressfältet beter sig. Riktiga enheter kan felsökas på distans (chrome://inspect för Android och Safari Web Inspector för iOS). Då måste enheten nå utvecklingsservern, vilket med ddev går att ordna till exempel med ddev share eller via det lokala nätverket.`,
  },
  {
    title: "Touch-event",
    text: `Touch kan hanteras med touchstart, touchmove och touchend, men Pointer Events (pointerdown, pointermove, pointerup) fungerar för mus, penna och finger med samma kod och är oftast det bättre valet. Lyssnare för scroll bör vara passive så att sidan inte hackar, och touch-action i CSS styr vilka gester webbläsaren hanterar själv. Vanliga click-händelser fungerar även med touch, utan den gamla fördröjningen på 300 ms, så länge viewport är korrekt satt.`,
    app: `Lagerappen använder click på knappar och länkar, som fungerar likadant för mus och finger.`,
  },
  {
    title: "Responsive design: storlekar, landskap och porträtt",
    text: `Layouten är mobile first: grunden görs för en smal skärm och byggs ut med min-width-media queries. Viewport-taggen skalar sidan rätt, och relativa enheter (rem, % och fr) gör layouten flytande. Orientering kan hanteras med @media (orientation: landscape), eftersom en telefon i landskap har låg höjd men stor bredd, och en platta ofta ligger mitt emellan.`,
    app: `Fakturatabellen byter utseende vid 720 px. Under den blir varje rad ett kort med etiketter, över den visas en vanlig tabell.`,
  },
  {
    title: "RESTful API:er och JSON",
    text: `Appen pratar med ett eget REST-API med resurserna /products, /orders och /invoices. Metoderna GET, POST, PUT och DELETE används, och data skickas som JSON. Statuskoderna har betydelse: 201 skapad, 400 felaktig indata, 401 ej inloggad, 404 saknas och 409 konflikt, som används när en order redan är fakturerad. Inloggning sker med en JWT som skickas i Authorization-headern.`,
    app: `All kommunikation går genom en enda funktion, request() i services/lager-api.js, som hanterar token, JSON och fel.`,
  },
  {
    title: "Mobil prestanda och tillgänglighet",
    text: `Prestanda: inga ramverk, få filer och bara de anrop som behövs gör appen snabb även på svagare mobiler och långsamma nät. Knappar låses medan ett anrop pågår så att inget skickas dubbelt. Tillgänglighet: fälten har label kopplade till sig, felmeddelanden har role="alert", notiser använder aria-live, tabellen har th med scope och en dold caption, dekorativa ikoner är aria-hidden och sidan har lang="sv". Allt går att använda med tangentbord.`,
  },
  {
    title: "Hårdvarufunktioner: splash screens, logotyper och filhantering",
    text: `En webapp kan få app-ikon och startbild genom ett web app manifest (namn, ikoner, theme_color och display) och, på iOS, apple-touch-icon och apple-touch-startup-image. Filhantering sker med ett fält av typen file med accept och capture för att välja eller ta en bild, och File API för att läsa filen. Andra webbläsar-API:er ger tillgång till bland annat position (Geolocation), vibration och kamera (getUserMedia).`,
    app: `Det här ingår inte i Lagerappen ännu. Lägger man till ett manifest måste CSP:n få manifest-src 'self', eftersom default-src är 'none'.`,
  },
  {
    title: "Webappar och hybrid webapp",
    text: `En ren webapp körs i webbläsaren och är begränsad till de API:er webbläsaren erbjuder. En hybridapp lägger webappen i ett skal, till exempel med Capacitor eller Cordova, och får via plugins tillgång till hårdvarunära funktioner som kamera, filsystem och push-notiser. Den kan också publiceras i app-butikerna. Fördelen är en gemensam kodbas, nackdelen är sämre prestanda och ett beroende av plugins och skalets uppdateringar.`,
  },
  {
    title: "Felsökning och debuggning",
    text: `I webbläsaren används Console för fel, Network för anrop och statuskoder, Elements för CSS och Application för lagrad data. Servern felsöks med loggar, curl eller Invoke-RestMethod och node --check.`,
    list: [
      `CSP som blockerade anrop, eftersom connect-src pekade på en annan port än BASE_URL.`,
      `Ett CORS-fel som egentligen berodde på att servern inte svarade alls.`,
      `"invalid ELF header", eftersom node_modules var installerad på Windows men kördes i en Linux-container.`,
      `En gammal serverprocess som svarade på rätt port med gammal kod.`,
    ],
    listIntro: `Exempel från arbetet med Lagerappen:`,
  },
  {
    title: "Utvecklingsmiljö och verktyg",
    text: `VS Code som editor, Node.js för servern (Express, SQLite, bcryptjs och jsonwebtoken), Git och GitHub för versionshantering och ddev (Docker) som lokal miljö med nginx, HTTPS och egna portar. Webbläsarens DevTools och en riktig mobil eller platta används för test.`,
    app: `API:t körs som en daemon i ddev och nås via en egen HTTPS-port.`,
  },
  {
    title: "Säkerhet i appen",
    text: `Lösenord hashas med bcrypt och inloggning sker med en JWT som går ut efter två timmar. Skyddade sidor kräver inloggning både i klienten och i API:t. All indata valideras på servern, och beloppet på en faktura räknas ut där. En strikt Content Security Policy tillåter bara skript och stilar från den egna sidan och anrop till API:t, vilket begränsar skadan om en XSS-sårbarhet skulle finnas.`,
  },
];

export default class AboutPage extends HTMLElement {
  connectedCallback() {
    const items = TOPICS.map(
      (t, i) => `
        <details class="about-item"${i === 0 ? " open" : ""}>
          <summary>${escapeHtml(t.title)}</summary>
          <div class="about-body">
            <p>${escapeHtml(t.text)}</p>
            ${
              t.list
                ? `<p>${escapeHtml(t.listIntro)}</p>
                   <ul>${t.list.map((li) => `<li>${escapeHtml(li)}</li>`).join("")}</ul>`
                : ""
            }
            ${t.app ? `<p class="about-app"><strong>I Lagerappen:</strong> ${escapeHtml(t.app)}</p>` : ""}
          </div>
        </details>
      `,
    ).join("");

    this.innerHTML = `
      <div class="card about">
        <h2 class="section-title">Om Lagerappen</h2>
        <p class="about-lead">
          Lagerappen är en mobilvänlig webapp för att hantera produkter, inleveranser,
          ordrar och fakturor. Den är byggd mobile first med HTML, CSS och JavaScript,
          utan ramverk, och körs mot ett eget REST-API (Express och SQLite) i en ddev-miljö
          på datorn. Här är kursens delar och hur de syns i appen.
        </p>
        ${items}
      </div>
    `;
  }
}

customElements.define("about-page", AboutPage);
