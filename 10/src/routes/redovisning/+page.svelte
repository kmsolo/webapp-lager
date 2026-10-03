<h1>Redovisning – Native design (Krav 3)</h1>

<section>
  <h2>Designprocess: att efterlikna Skånetrafiken</h2>
  <p>
    Jag valde att utgå från Skånetrafikens webbapp, eftersom jag använder den dagligen för att
    resa i Helsingborgsområdet och den delar samma grundläggande vystruktur som min egen app: en
    lista med tider och avgångar, samt en kartvy. Processen började med att jag tog skärmdumpar av
    startsidan och avgångslistan för att ha ett konkret referensmaterial att jämföra mot, istället
    för att lita på minnet av hur appen "brukar se ut". Jag använde webbläsarens
    utvecklarverktyg (F12, Inspektör) för att hovra över element i Skånetrafikens gränssnitt och
    läsa av exakta hex-koder för deras färgpalett, snarare än att gissa mig till nyanserna.
  </p>
  <p>
    På så sätt kunde jag identifiera att appen bygger på en vinröd/mörkröd huvudfärg (ungefär
    #7a1f2c) för knappar och rubriker, kompletterad med en klarare röd logotypfärg och en tunn röd
    kant som återkommande designelement. Det mest distinkta mönstret jag ville återskapa var hur
    försenade avgångar visas: den ursprungliga tiden visas överstruken i grått, medan den nya
    beräknade tiden markeras med en gul bakgrund och fetstil, vilket ger användaren en omedelbar
    visuell signal om förseningen utan att behöva läsa någon text.
  </p>
  <p>
    Jag återanvände samma mönster i min egen lista över försenade tåg, där jag ersatte en enkel
    "+X min"-etikett med samma överstruken-tid-plus-gulmarkering-princip. Jag efterliknade även
    deras statusmärken, som "HAR PASSERAT" i en grå kapsel med versaler, genom att skapa en
    motsvarande röd "INSTÄLLT"-badge för inställda tåg i min egen app. Layoutmässigt kopierade jag
    deras kortbaserade lista med vita bakgrunder, tunna kantlinjer och rundade hörn, samt deras
    användning av små färgade "piller" för att visa transportslag.
  </p>
  <p>
    Typografiskt noterade jag att deras rubriker använder ett serif-typsnitt medan brödtext och
    navigering är sans-serif, vilket jag återskapade med Georgia som rubriktypsnitt i min egen
    CSS. Jag matchade även deras knappstil: rundade, pill-formade knappar i den vinröda
    huvudfärgen med vit text. En utmaning var att jag inte hade tillgång till Skånetrafikens
    faktiska designfiler eller typsnittsnamn, så vissa detaljer är uppskattade approximationer
    snarare än exakta kopior.
  </p>
  <p>
    Jag valde också att inte kopiera deras hero-bild med reseinspiration, eftersom det inte är
    relevant för en app som fokuserar på tågförseningar snarare än att boka resor. Sammantaget
    handlade processen mer om att identifiera och återanvända distinkta designmönster (färgpalett,
    tidsvisning vid försening, statusmärken, kortlayout) än att pixel-för-pixel kopiera varje
    enskilt element, vilket jag anser gav en trovärdig känsla av att appen tillhör samma
    designfamilj utan att bli en exakt kloning.
  </p>
</section>

<section>
  <h2>Skärmdumpar från Skånetrafiken</h2>
  <p><em>Lägg in dina tre skärmdumpar här, t.ex. med enkla &lt;img&gt;-taggar eller en bildkarusell.</em></p>
</section>

<style>
  h1 { color: #7a1f2c; font-family: Georgia, serif; }
  h2 { color: #7a1f2c; font-size: 1.2rem; margin-top: 1.5rem; }
  p { line-height: 1.6; color: #2b1114; margin-bottom: 1rem; }
</style>