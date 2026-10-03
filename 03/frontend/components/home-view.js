export default class HomeView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="card">
        <h1>Välkommen</h1>
        <p>Det här är startsidan för kmom02.</p>
        <p>Här ska vi skapa en CRUD-funktion för att hantera produkter.</p>
        <p>Välj Produkter för att se produktlistan.</p>
      </section>
    `;
  }
}
