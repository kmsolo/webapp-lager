import { createProduct } from "../services/lager-api.js";
import { showToast } from "../utils/toast.js";

export default class ProductForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Ny produkt</h2>

        <form id="createForm" class="form" novalidate>
          <label for="name">Namn</label>
          <input type="text" id="name" name="name" minlength="2" required autocomplete="off">

          <label for="stock">Lager</label>
          <input type="number" id="stock" name="stock" min="0" step="1" required>

          <label for="location">Plats</label>
          <input type="text" id="location" name="location" required autocomplete="off">

          <p id="errorBox" class="error" role="alert"></p>

          <button type="submit" class="primary-btn">Spara produkt</button>
        </form>
      </div>
    `;

    const form = this.querySelector("#createForm");
    const errorBox = this.querySelector("#errorBox");
    const submitBtn = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBox.textContent = "";

      const data = new FormData(form);
      const name = data.get("name").trim();
      const stock = Number(data.get("stock"));
      const location = data.get("location").trim();

      const errors = [];
      if (name.length < 2) errors.push("Namnet måste vara minst 2 tecken.");
      if (!Number.isInteger(stock) || stock < 0) {
        errors.push("Lager måste vara ett heltal som är 0 eller större.");
      }
      if (location.length < 1) errors.push("Plats måste fyllas i.");

      if (errors.length > 0) {
        errorBox.textContent = errors.join(" ");
        return;
      }

      submitBtn.disabled = true;
      try {
        await createProduct({ name, stock, location });
        showToast("Produkt skapad!");
        window.location.hash = "#/products";
      } catch (error) {
        console.error(error);
        errorBox.textContent = "Kunde inte spara produkten. Försök igen.";
        submitBtn.disabled = false;
      }
    });
  }
}

customElements.define("product-form", ProductForm);
