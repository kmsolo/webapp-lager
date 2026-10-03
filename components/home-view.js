export default class HomeView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div class="content-card">
      <section class="card">
        <h1>Välkommen</h1>
        <p>Det här är startsidan för kmom01 i kursen webapp från dbwebb.</p>
        <p>Dbwebb hittar vi på <a href="https://dbwebb.se" target="_blank">dbwebb.se</a>.</p>
        <p>Här har vi kspat en plats med html, css och javascript. <br>
          Välj Lagerlista för att se produkterna.</p>
          <p>Välj Hela Lagret för att se produkter som är inlagt hos EMil Folino vid BTH.</p>
          <p>Välj Om för att läsa mer om kursmomentet.</p>

      </section>
      </div>
    `;
  }
}
