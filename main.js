import "./components/app-header.js";
import "./components/about-page.js";
import "./components/login-form.js";
import "./components/register-form.js";
import "./components/product-list.js";
import "./components/product-form.js";
import "./components/product-edit.js";
import "./components/product-delete.js";
import "./components/delivery-list.js";
import "./components/delivery-form.js";
import "./components/order-form.js";
import "./components/invoice-list.js";
import "./components/invoice-form.js";
import AppRouter from "./router.js";

customElements.define("app-router", AppRouter);
