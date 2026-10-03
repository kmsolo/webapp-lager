import { getProducts } from "../services/lager-api.js";

export default class ProductList extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = "<p>Laddar produkter...</p>";

    try {
      const products = await getProducts();

      this.innerHTML = `
                <section class="card">
                    <h2>Lagerlista från vårt lager</h2>
                    <ul class="products">
                        ${products
                          .map(
                            (product) => `
                                <li class="product-item">
                                    <h3>${product.name}</h3>
                                    <p>ID: ${product.id}</p>
                                    <p>Stock: ${product.stock}</p>
                                    <p>Location: ${product.location}</p>
                                    <p>
                                        <button class="edit-product" data-id="${product.id}">
                                            Redigera
                                        </button>
                                    </p>
                                </li>
                            `,
                          )
                          .join("")}
                    </ul>
                </section>
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
