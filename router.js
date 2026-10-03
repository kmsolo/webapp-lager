export default class AppRouter extends HTMLElement {
  constructor() {
    super();

    this.routes = {
      "": {
        name: "Hem",
        view: "<home-view></home-view>",
      },

      lager: {
        name: "Lagerlista",
        view: "<product-list></product-list>",
      },

      om: {
        name: "Om",
        view: "<about-view></about-view>",
      },

      kontakt: {
        name: "Kontakt",
        view: "<contact-view></contact-view>",
      },
      total: {
        name: "Hela lagret",
        view: "<total-lager></total-lager>",
      },
    };
  }

  connectedCallback() {
    this.resolveRoute = this.resolveRoute.bind(this);
    window.addEventListener("hashchange", this.resolveRoute);
    this.resolveRoute();
  }

  disconnectedCallback() {
    window.removeEventListener("hashchange", this.resolveRoute);
  }

  resolveRoute() {
    this.currentRoute = location.hash.replace("#", "").replace("/", "");
    this.render();
  }

  render() {
    const route = this.routes[this.currentRoute];

    this.innerHTML = route ? route.view : "<p>Sidan finns inte.</p>";
  }
}
