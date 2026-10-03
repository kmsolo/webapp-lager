import ProductForm from "./components/product-form.js";
import ProductEdit from "./components/product-edit.js";
import ProductDelete from "./components/product-delete.js";

customElements.define("product-form", ProductForm);
customElements.define("product-edit", ProductEdit);
customElements.define("product-delete", ProductDelete);

function router() {
  const hash = window.location.hash;

  if (hash === "#/create") {
    document.querySelector("#app").innerHTML = "<product-form></product-form>";
  } else if (hash.startsWith("#edit-")) {
    document.querySelector("#app").innerHTML = "<product-edit></product-edit>";
  } else if (hash.startsWith("#delete-")) {
    document.querySelector("#app").innerHTML =
      "<product-delete></product-delete>";
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
