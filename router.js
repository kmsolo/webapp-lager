import { isLoggedIn } from "./services/auth.js";

const GUEST_ONLY = new Set(["#/login", "#/register"]);
const OPEN_ROUTES = new Set([...GUEST_ONLY, "#/about"]);

export default class AppRouter extends HTMLElement {
  constructor() {
    super();
    this._onChange = () => this.update();
  }

  connectedCallback() {
    window.addEventListener("hashchange", this._onChange);
    window.addEventListener("authchange", this._onChange);
    this.update();
  }

  disconnectedCallback() {
    window.removeEventListener("hashchange", this._onChange);
    window.removeEventListener("authchange", this._onChange);
  }

  render(tag, id) {
    const app = document.querySelector("#app");
    if (!app) return;
    const el = document.createElement(tag);
    if (id) el.dataset.id = id;
    app.replaceChildren(el);
  }

  update() {
    const hash = window.location.hash;
    const loggedIn = isLoggedIn();

    // Route guard: allt utom login/registrering kräver inloggning
    if (!loggedIn && !OPEN_ROUTES.has(hash)) {
      if (hash !== "#/login") window.location.hash = "#/login";
      return this.render("login-form");
    }
    if (loggedIn && GUEST_ONLY.has(hash)) {
      window.location.hash = "#/products";
      return;
    }

    if (hash === "#/about") return this.render("about-page");
    if (hash === "#/login") return this.render("login-form");
    if (hash === "#/register") return this.render("register-form");

    if (hash === "#/new-order") return this.render("order-form");

    if (hash === "#/invoices") return this.render("invoice-list");
    if (hash === "#/new-invoice") return this.render("invoice-form");

    if (hash === "#/deliveries") return this.render("delivery-list");
    if (hash === "#/new-delivery") return this.render("delivery-form");
    if (hash === "#/create") return this.render("product-form");

    if (hash.startsWith("#edit-")) {
      return this.render("product-edit", hash.slice("#edit-".length));
    }
    if (hash.startsWith("#delete-")) {
      return this.render("product-delete", hash.slice("#delete-".length));
    }

    this.render("product-list");
  }
}
