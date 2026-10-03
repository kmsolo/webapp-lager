import { getProduct } from "../services/lager-api.js";

export default class ProductEdit extends HTMLElement {
  async connectedCallback() {
    const id = window.location.hash.split("-")[1];
    const product = await getProduct(id);

    this.innerHTML = `
            <div class="card">
                <h2>Redigera produkt</h2>

                <form id="editForm">
                    <label>Namn</label>
                    <input type="text" name="name" value="${product.name}" required>

                    <label>Lager</label>
                    <input type="number" name="stock" value="${product.stock}" required>

                    <label>Plats</label>
                    <input type="text" name="location" value="${product.location}" required>

                    <button class="primary-btn">Uppdatera</button>
                </form>
            </div>
        `;

    this.querySelector("#editForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = new FormData(e.target);
      const data = Object.fromEntries(form);

      await fetch(`https://lager.emilfolino.se/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      window.location.hash = "#/lagerlista";
    });
  }
}
