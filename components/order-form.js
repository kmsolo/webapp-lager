import { createOrder, getProducts } from "../services/lager-api.js";
import { showToast } from "../utils/toast.js";

export default class OrderForm extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<p>Laddar produkter...</p>`;

    let products;
    try {
      products = await getProducts();
    } catch (error) {
      console.error(error);
      this.innerHTML = `<p role="alert">Kunde inte hämta produkter.</p>`;
      return;
    }

    if (products.length === 0) {
      this.innerHTML = `
        <p>Du måste skapa en produkt innan du kan skapa en order.</p>
        <a href="#/create">Ny produkt</a>
      `;
      return;
    }

    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Ny order</h2>

        <form id="orderForm" class="form" novalidate>
          <label for="customer">Kund</label>
          <input type="text" id="customer" name="customer" minlength="2" maxlength="100" autocomplete="off" required>

          <label for="product_id">Produkt</label>
          <select id="product_id" name="product_id" required></select>

          <label for="quantity">Antal</label>
          <input type="number" id="quantity" name="quantity" min="1" step="1" required>

          <label for="unit_price">Pris per styck (kr)</label>
          <input type="number" id="unit_price" name="unit_price" min="0" step="0.01" required>

          <p id="errorBox" class="error" role="alert"></p>

          <div class="btn-row">
            <button type="submit" class="primary-btn">Skapa order</button>
            <button type="button" class="secondary-btn" id="cancelBtn">Avbryt</button>
          </div>
        </form>
      </div>
    `;

    const form = this.querySelector("#orderForm");
    const errorBox = this.querySelector("#errorBox");
    const submitBtn = form.querySelector("button[type='submit']");
    const select = form.elements.product_id;

    select.add(new Option("Välj produkt", ""));
    for (const p of products) {
      select.add(new Option(`${p.name} (lager: ${p.stock})`, p.id));
    }

    this.querySelector("#cancelBtn").addEventListener("click", () => {
      window.location.hash = "#/products";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBox.textContent = "";

      const customer = form.elements.customer.value.trim();
      const product_id = Number(select.value);
      const quantity = Number(form.elements.quantity.value);
      const unit_price = Number(form.elements.unit_price.value);

      const errors = [];
      if (customer.length < 2) errors.push("Kund måste vara minst 2 tecken.");
      if (!Number.isInteger(product_id) || product_id < 1) errors.push("Välj en produkt.");
      if (!Number.isInteger(quantity) || quantity < 1) errors.push("Antal måste vara ett heltal större än 0.");
      if (form.elements.unit_price.value === "" || !Number.isFinite(unit_price) || unit_price < 0) {
        errors.push("Ange ett giltigt pris.");
      }
      if (errors.length > 0) {
        errorBox.textContent = errors.join(" ");
        return;
      }

      submitBtn.disabled = true;
      try {
        await createOrder({ customer, product_id, quantity, unit_price });
        showToast("Order skapad!");
        window.location.hash = "#/new-invoice";
      } catch (error) {
        console.error(error);
        errorBox.textContent = "Kunde inte skapa ordern. Försök igen.";
        submitBtn.disabled = false;
      }
    });
  }
}

customElements.define("order-form", OrderForm);
