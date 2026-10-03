"use strict";

import CreateProduct from "./pages/create-product.js";
import DeliveriesPage from "./pages/deliveries-page.js";
import EditProduct from "./pages/edit-product.js";
import NewDeliveryPage from "./pages/new-delivery-page.js";

import HomeView from "./components/home-view.js";

export default class AppRouter extends HTMLElement {
  connectedCallback() {
    this.render();
    window.addEventListener("hashchange", () => this.render());
  }

  render() {
    const hash = window.location.hash || "#home";
    const route = hash.replace("#", "");

    let view;

    switch (route) {
      case "create":
        view = new CreateProduct();
        break;
      case "deliveries":
        view = new DeliveriesPage();
        break;
      case "new-delivery":
        view = new NewDeliveryPage();
        break;
      default:
        if (route.startsWith("edit-")) {
          view = new EditProduct();
        } else {
          view = new HomeView();
        }
        break;
    }

    this.innerHTML = "";
    this.appendChild(view);
  }
}
