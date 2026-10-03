import { getProducts } from "../services/lager-api.js";

export default class ProductList extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = "<p>Laddar produkter...</p>";

    try {
      const products = await getProducts();

      this.innerHTML = `
    <h2 class="section-title">Lagerlista från vårt lager</h2>

    <div class="product-list">
        ${products
          .map(
            (product) => `
                    <div class="card">
                        <h3>${product.name}</h3>
                        <p><strong>ID:</strong> ${product.id}</p>
                        <p><strong>Lager:</strong> ${product.stock}</p>
                        <p><strong>Plats:</strong> ${product.location}</p>
                        <button class="edit-product" data-id="${product.id}">
                            Redigera
                        </button>
                    </div>
                `,
          )
          .join("")}
    </div>
`;

      this.querySelectorAll(".edit-product").forEach((button) => {
        button.addEventListener("click", (event) => {
          const id = event.currentTarget.dataset.id;
          window.location.hash = `#edit-${id}`;
        });
      });
    } catch (error) {
      console.error(error);
      this.innerHTML = "<p>Kunde inte hämta produkter.</p>";
    }
  }
}
