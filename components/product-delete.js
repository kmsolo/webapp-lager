import { getProduct, deleteProduct } from "../services/lager-api.js";
import { showToast } from "../utils/toast.js";
import { escapeHtml } from "../utils/escape-html.js";

export default class ProductDelete extends HTMLElement {
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
        <h2 class="section-title">Ta bort produkt</h2>

        <div class="product-info">
          <p><strong>Namn:</strong> ${escapeHtml(product.name)}</p>
          <p><strong>Lager:</strong> ${escapeHtml(product.stock)}</p>
          <p><strong>Plats:</strong> ${escapeHtml(product.location || "–")}</p>
        </div>

        <p class="warning-text">
          Är du säker på att du vill ta bort denna produkt?
        </p>

        <p id="error" role="alert"></p>

        <div class="btn-row">
          <button class="danger-btn" id="deleteBtn">Ta bort</button>
          <button class="secondary-btn" id="cancelBtn">Avbryt</button>
        </div>
      </div>
    `;

    const deleteBtn = this.querySelector("#deleteBtn");
    const errorEl = this.querySelector("#error");

    deleteBtn.addEventListener("click", async () => {
      deleteBtn.disabled = true;
      errorEl.textContent = "";

      try {
        await deleteProduct(id);
        showToast("Produkt borttagen!");
        window.location.hash = "#/products";
      } catch (error) {
        console.error(error);
        errorEl.textContent = "Kunde inte ta bort produkten. Försök igen.";
        deleteBtn.disabled = false;
      }
    });

    this.querySelector("#cancelBtn").addEventListener("click", () => {
      window.location.hash = "#/products";
    });
  }
}

customElements.define("product-delete", ProductDelete);
