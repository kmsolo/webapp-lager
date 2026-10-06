"use strict";

import AppHeader from "./components/app-header.js";
import TotalLager from "./components/total-lager.js";
import AppRouter from "./router.js";

import HomeView from "./components/home-view.js";
import AboutView from "./components/about-view.js";
import ContactView from "./components/contact-view.js";
import ProductList from "./components/product-list.js";
import LagerTitle from "./components/lager-title.js";

import CreateProduct from "./pages/create-product.js";
import DeliveriesPage from "./pages/deliveries-page.js";
import EditProduct from "./pages/edit-product.js";
import NewDeliveryPage from "./pages/new-delivery-page.js";

console.log("main.js laddas");

if (!customElements.get("app-header"))
  customElements.define("app-header", AppHeader);
if (!customElements.get("app-router"))
  customElements.define("app-router", AppRouter);
if (!customElements.get("home-view"))
  customElements.define("home-view", HomeView);
if (!customElements.get("about-view"))
  customElements.define("about-view", AboutView);
if (!customElements.get("contact-view"))
  customElements.define("contact-view", ContactView);
if (!customElements.get("product-list"))
  customElements.define("product-list", ProductList);
if (!customElements.get("total-lager"))
  customElements.define("total-lager", TotalLager);
if (!customElements.get("lager-title"))
  customElements.define("lager-title", LagerTitle);
if (!customElements.get("create-product"))
  customElements.define("create-product", CreateProduct);
if (!customElements.get("deliveries-page"))
  customElements.define("deliveries-page", DeliveriesPage);
if (!customElements.get("edit-product"))
  customElements.define("edit-product", EditProduct);
if (!customElements.get("new-delivery-page"))
  customElements.define("new-delivery-page", NewDeliveryPage);
