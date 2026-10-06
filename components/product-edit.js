import { getProduct, updateProduct } from "../services/lager-api.js";
import { showToast } from "../utils/toast.js";

export default class ProductEdit extends HTMLElement {
  async connectedCallback() {
    const id = this.dataset.id;
    this.innerHTML = `<p>Laddar produkt...</p>`;

    let product;
    try {
      product = await getProduct(id);
    } catch (error) {
      console.error(error);
    }

    if (!product) {
      this.innerHTML = `
        <p role="alert">Produkten hittades inte.</p>
        <a href="#/products">Tillbaka till lagerlistan</a>
      `;
      return;
    }

    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Redigera produkt</h2>

        <form id="editForm" class="form" novalidate>
          <label for="name">Namn</label>
          <input type="text" id="name" name="name" minlength="2" required autocomplete="off">

          <label for="stock">Lager</label>
          <input type="number" id="stock" name="stock" min="0" step="1" required>

          <label for="location">Plats</label>
          <input type="text" id="location" name="location" required autocomplete="off">

          <p id="errorBox" class="error" role="alert"></p>

          <div class="btn-row">
            <button type="submit" class="primary-btn">Uppdatera produkt</button>
            <button type="button" class="secondary-btn" id="cancelBtn">Avbryt</button>
          </div>
        </form>
      </div>
    `;

    const form = this.querySelector("#editForm");
    const errorBox = this.querySelector("#errorBox");
    const submitBtn = form.querySelector("button[type='submit']");

    // Sätt värden via DOM: säkert mot citattecken och XSS
    form.elements.name.value = product.name ?? "";
    form.elements.stock.value = product.stock ?? 0;
    form.elements.location.value = product.location ?? "";

    this.querySelector("#cancelBtn").addEventListener("click", () => {
      window.location.hash = "#/products";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBox.textContent = "";

      const name = form.elements.name.value.trim();
      const stock = Number(form.elements.stock.value);
      const location = form.elements.location.value.trim();

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
        await updateProduct({ id, name, stock, location });
        showToast("Produkt uppdaterad!");
        window.location.hash = "#/products";
      } catch (error) {
        console.error(error);
        errorBox.textContent = "Kunde inte uppdatera produkten. Försök igen.";
        submitBtn.disabled = false;
      }
    });
  }
}

customElements.define("product-edit", ProductEdit);
