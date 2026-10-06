"use strict";

export default class ProductList extends HTMLElement {
  connectedCallback() {
    this.render();
    this.loadProducts();
  }

  render() {
    this.innerHTML = `
            <section class="product-list">
                <h2>Produkter</h2>
                <p id="status">Laddar produkter...</p>
                <ul id="products"></ul>
            </section>
        `;

    this.statusEl = this.querySelector("#status");
    this.productsEl = this.querySelector("#products");
  }

  async loadProducts() {
    try {
      const response = await fetch(
        "/webapp/kmom/02/backend/router.php?route=products",
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const products = await response.json();

      if (!products.length) {
        this.statusEl.textContent = "Inga produkter hittades.";

        this.productsEl.innerHTML = "";
        return;
      }

      this.statusEl.textContent = "";

      this.productsEl.innerHTML = products
        .map(
          (product) => `
                        <li class="product">
                            <strong>${product.name}</strong><br>
                            Lager: ${product.stock}<br>
                            Plats: ${product.location}<br>

                            <div class="product-actions">
    <a
        class="button button-edit"
        href="#edit-${product.id}"
    >
        Redigera
    </a>

    <button
        class="button button-delete"
        type="button"
        data-delete-id="${product.id}"
    >
        Ta bort
    </button>
</div>
                        </li>
                    `,
        )
        .join("");

      this.productsEl.querySelectorAll("[data-delete-id]").forEach((button) => {
        button.addEventListener("click", () => {
          this.deleteProduct(Number(button.dataset.deleteId));
        });
      });
    } catch (error) {
      this.statusEl.textContent = `Kunde inte ladda produkter: ${error.message}`;
    }
  }

  async deleteProduct(id) {
    if (!confirm("Vill du verkligen ta bort produkten?")) {
      return;
    }

    try {
      const response = await fetch(
        `/webapp/kmom/02/backend/router.php?route=products&id=${id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      this.statusEl.textContent = result.message || "Produkten togs bort.";

      await this.loadProducts();
    } catch (error) {
      this.statusEl.textContent = `Kunde inte ta bort produkten: ${error.message}`;
    }
  }
}
