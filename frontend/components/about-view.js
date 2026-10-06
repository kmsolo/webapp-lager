export default class AboutView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="card">
        <h1>Om kmom02</h1>
        <p>Här samlar jag allt arbete för kursmomentet kmom02.</p>
        <p>Vi skapade sidor i /components, som renderar innehållet.</p>
        <pre>Jag hade problem med att få till en bra struktur på mina komponenter, men efter att ha läst på kurslitteraturen 
        och sett på exempel från andra kursdeltagare, så fick jag till det på ett bra sätt.</pre>
        <p>Jag har även skapat en egen komponent som renderar en lista med länkar till de olika sidorna i kursmomentet.</p>
        <p>Vi har även lagt till innehåll till mitt GitHub-repo, där jag har lagt upp koden för kursmoment 02.</p>
      </section>
    `;
  }
}
