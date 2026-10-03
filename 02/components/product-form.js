export default class ProductForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <div class="card">
                <h2>Ny produkt</h2>

                <form id="createForm">
                    <label>Namn</label>
                    <input type="text" name="name" required>

                    <label>Lager</label>
                    <input type="number" name="stock" required>

                    <label>Plats</label>
                    <input type="text" name="location" required>

                    <button class="primary-btn">Spara</button>
                </form>
            </div>
        `;

    this.querySelector("#createForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = new FormData(e.target);
      const data = Object.fromEntries(form);

      await fetch("https://lager.emilfolino.se/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      window.location.hash = "#/lagerlista";
    });
  }
}
