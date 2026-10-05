export default class LagerTitle extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>Lagerappen</h1>
      <nav>
        <a href="#lager">Lagerlista</a>
      </nav>
    `;
  }
}
