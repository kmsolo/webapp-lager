import { getProducts } from "../services/lager-api.js";
import { escapeHtml } from "../utils/escape-html.js";

// Gräns för "lågt saldo". Ändra efter behov.
const LOW_STOCK = 5;

function stockInfo(stock) {
  const n = Number(stock);
  if (n <= 0) return { cls: "stock-out", label: "Slut" };
  if (n <= LOW_STOCK) return { cls: "stock-low", label: `${n} st – lågt` };
  return { cls: "stock-ok", label: `${n} st` };
}

export default class ProductList extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<p>Laddar produkter...</p>`;

    try {
      const products = await getProducts();

      if (products.length === 0) {
        this.innerHTML = `
          <section class="list-frame">
            <h2 class="section-title">Lagerlista</h2>
            <p>Inga produkter ännu.</p>
          </section>
        `;
        return;
      }

      this.innerHTML = `
        <section class="list-frame">
        <h2 class="section-title">Lagerlista</h2>
        <div class="product-grid">
          ${products
            .map((p) => {
              const s = stockInfo(p.stock);
              return `
            <article class="product-card">
              <header class="product-card-head">
                <h3>${escapeHtml(p.name)}</h3>
                <span class="stock-badge ${s.cls}">${escapeHtml(s.label)}</span>
              </header>

              <dl class="product-meta">
                <div><dt>ID</dt><dd>${escapeHtml(p.id)}</dd></div>
                <div><dt>Plats</dt><dd>${escapeHtml(p.location || "–")}</dd></div>
              </dl>

              <div class="btn-row">
                <button class="primary-btn" data-edit="${escapeHtml(p.id)}">Redigera</button>
                <button class="danger-btn" data-delete="${escapeHtml(p.id)}">Ta bort</button>
              </div>
            </article>
          `;
            })
            .join("")}
        </div>
        </section>
      `;

      this.addEventListener("click", (e) => {
        const edit = e.target.closest("[data-edit]");
        const del = e.target.closest("[data-delete]");
        if (edit) window.location.hash = `#edit-${edit.dataset.edit}`;
        if (del) window.location.hash = `#delete-${del.dataset.delete}`;
      });
    } catch (error) {
      console.error(error);
      this.innerHTML = `<p role="alert">Kunde inte hämta produkter.</p>`;
    }
  }
}

customElements.define("product-list", ProductList);
