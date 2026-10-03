export default class ProductDelete extends HTMLElement {
  connectedCallback() {
    const id = window.location.hash.split("-")[1];

    this.innerHTML = `
            <div class="card">
                <h2>Ta bort produkt</h2>
                <p>Är du säker på att du vill ta bort produkt med ID <strong>${id}</strong>?</p>

                <button id="deleteBtn" class="danger-btn">Ta bort</button>
                <button id="cancelBtn" class="primary-btn">Avbryt</button>
            </div>
        `;

    this.querySelector("#deleteBtn").addEventListener("click", async () => {
      await fetch(`https://lager.emilfolino.se/products/${id}`, {
        method: "DELETE",
      });

      window.location.hash = "#/lagerlista";
    });

    this.querySelector("#cancelBtn").addEventListener("click", () => {
      window.location.hash = "#/lagerlista";
    });
  }
}
