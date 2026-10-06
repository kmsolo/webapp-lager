import { isLoggedIn, getEmail, logout } from "../services/auth.js";

export default class AppHeader extends HTMLElement {
  constructor() {
    super();
    this._render = () => this.render();
  }

  connectedCallback() {
    window.addEventListener("authchange", this._render);
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener("authchange", this._render);
  }

  render() {
    const loggedIn = isLoggedIn();

    this.innerHTML = `
      <header class="topbar">
        <div class="header-inner">
          <h1>Lagerapp – Del 3</h1>
          <nav class="app-nav" aria-label="Huvudmeny">
            ${
              loggedIn
                ? `
              <a class="nav-icon-btn" href="#/products"><span aria-hidden="true">📦</span> Produkter</a>
              <a class="nav-icon-btn" href="#/deliveries"><span aria-hidden="true">📥</span> Inleveranser</a>
              <a class="nav-icon-btn" href="#/new-delivery"><span aria-hidden="true">➕</span> Ny inleverans</a>
              <a class="nav-icon-btn" href="#/create"><span aria-hidden="true">🎁</span> Ny produkt</a>
              <a class="nav-icon-btn" href="#/new-order"><span aria-hidden="true">🛒</span> Ny order</a>
              <a class="nav-icon-btn" href="#/invoices"><span aria-hidden="true">🧾</span> Fakturor</a>
              <a class="nav-icon-btn" href="#/new-invoice"><span aria-hidden="true">✍️</span> Ny faktura</a>
                         
            `
                : `
              <a class="nav-icon-btn" href="#/login">Logga in</a>
              <a class="nav-icon-btn" href="#/register">Registrera</a>
            `
            }
            <a class="nav-icon-btn" href="#/about"><span aria-hidden="true">ℹ️</span> Om</a>
            
            <div class="nav-icon-btn">
              Inloggad:<span class="user-email" id="userEmail"></span>
            </div>
            <button type="button" class="nav-btn" id="logoutBtn">Logga ut</button>
            <a class="nav-btn" href="https://dbwebbyearone.ddev.site:8443/webapp/">Till Webapp</a>
          </nav>
        </div>
      </header>
    `;

    if (loggedIn) {
      this.querySelector("#userEmail").textContent = getEmail() ?? "";
      this.querySelector("#logoutBtn").addEventListener("click", logout);
    }
  }
}

customElements.define("app-header", AppHeader);
