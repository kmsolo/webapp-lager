import { createDelivery, getProducts } from "../services/lager-api.js";
import { showToast } from "../utils/toast.js";

// Lokalt datum (toISOString ger UTC och kan bli fel dag)
function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default class DeliveryForm extends HTMLElement {
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
        <p>Du måste skapa en produkt innan du kan registrera en inleverans.</p>
        <a href="#/create">Ny produkt</a>
      `;
      return;
    }

    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Ny inleverans</h2>

        <form id="deliveryForm" class="form" novalidate>
          <label for="product_id">Produkt</label>
          <select id="product_id" name="product_id" required></select>

          <label for="amount">Antal</label>
          <input type="number" id="amount" name="amount" min="1" step="1" required>

          <label for="delivery_date">Datum</label>
          <input type="date" id="delivery_date" name="delivery_date" required>

          <label for="comment">Kommentar</label>
          <input type="text" id="comment" name="comment" autocomplete="off">

          <p id="errorBox" class="error" role="alert"></p>

          <div class="btn-row">
            <button type="submit" class="primary-btn">Spara</button>
            <button type="button" class="secondary-btn" id="cancelBtn">Avbryt</button>
          </div>
        </form>
      </div>
    `;

    const form = this.querySelector("#deliveryForm");
    const errorBox = this.querySelector("#errorBox");
    const submitBtn = form.querySelector("button[type='submit']");
    const select = form.elements.product_id;

    // Alternativ via DOM: säkert mot XSS
    select.add(new Option("Välj produkt", ""));
    for (const p of products) {
      select.add(new Option(p.name, p.id));
    }
    form.elements.delivery_date.value = today();

    this.querySelector("#cancelBtn").addEventListener("click", () => {
      window.location.hash = "#/deliveries";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBox.textContent = "";

      const product_id = Number(select.value);
      const amount = Number(form.elements.amount.value);
      const delivery_date = form.elements.delivery_date.value;
      const comment = form.elements.comment.value.trim();

      const errors = [];
      if (!Number.isInteger(product_id) || product_id < 1) {
        errors.push("Välj en produkt.");
      }
      if (!Number.isInteger(amount) || amount < 1) {
        errors.push("Antal måste vara ett heltal större än 0.");
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(delivery_date)) {
        errors.push("Ange ett giltigt datum.");
      }

      if (errors.length > 0) {
        errorBox.textContent = errors.join(" ");
        return;
      }

      submitBtn.disabled = true;
      try {
        await createDelivery({
          product_id,
          amount,
          delivery_date,
          comment: comment || null,
        });
        showToast("Inleverans sparad!");
        window.location.hash = "#/deliveries";
      } catch (error) {
        console.error(error);
        errorBox.textContent = "Kunde inte spara inleveransen. Försök igen.";
        submitBtn.disabled = false;
      }
    });
  }
}

customElements.define("delivery-form", DeliveryForm);
