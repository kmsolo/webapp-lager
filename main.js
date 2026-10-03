console.log("main.js laddas");

import AppHeader from "./components/app-header.js";
import AppRouter from "./router.js";
import HomeView from "./components/home-view.js";
import AboutView from "./components/about-view.js";
import ProductList from "./components/product-list.js";
import ContactView from "./components/contact-view.js";
import TotalLager from "./components/total-lager.js";
/* import CreateProduct from "./components/create-product.js"; */
/* import EditProduct from "./components/edit-product.js"; */

console.log("main.js laddas");

if (!customElements.get("app-header")) {
  customElements.define("app-header", AppHeader);
}
if (!customElements.get("app-router")) {
  customElements.define("app-router", AppRouter);
}
if (!customElements.get("home-view")) {
  customElements.define("home-view", HomeView);
}
if (!customElements.get("about-view")) {
  customElements.define("about-view", AboutView);
}
if (!customElements.get("product-list")) {
  customElements.define("product-list", ProductList);
}
if (!customElements.get("contact-view")) {
  customElements.define("contact-view", ContactView);
}
if (!customElements.get("total-lager")) {
  customElements.define("total-lager", TotalLager);
}
/* if (!customElements.get("create-product")) {
  customElements.define("create-product", CreateProduct);
}
if (!customElements.get("edit-product")) {
  customElements.define("edit-product", EditProduct);
} */
