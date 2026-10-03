"use strict";

export default class AppRouter extends HTMLElement {
  connectedCallback() {
    this.render();

    window.addEventListener("hashchange", () => {
      this.render();
    });
  }

  render() {
    const hash = window.location.hash || "#home";
    const route = hash.substring(1);

    let view;

    if (route.startsWith("edit-")) {
      const id = route.substring(5);

      view = document.createElement("edit-product");
      view.setAttribute("product-id", id);
    } else {
      switch (route) {
        case "home":
          view = document.createElement("home-view");
          break;

        case "about":
          view = document.createElement("about-view");
          break;

        case "contact":
          view = document.createElement("contact-view");
          break;

        case "products":
          view = document.createElement("product-list");
          break;

        case "create":
          view = document.createElement("create-product");
          break;

        case "deliveries":
          view = document.createElement("deliveries-page");
          break;

        case "new-delivery":
          view = document.createElement("new-delivery-page");
          break;

        default:
          view = document.createElement("home-view");
      }
    }

    this.replaceChildren(view);
  }
}
