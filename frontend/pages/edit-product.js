"use strict";

export default class EditProduct extends HTMLElement {
  connectedCallback() {
    this.productId = this.getAttribute("product-id");

    this.render();
    this.loadProduct();
  }

  render() {
    this.innerHTML = `
            <section class="edit-product">
                <h2>Redigera produkt</h2>

                <form id="edit-product-form">
                    <p>
                        <label for="name">Namn</label><br>
                        <input type="text" id="name" required>
                    </p>

                    <p>
                        <label for="stock">Lager</label><br>
                        <input
                            type="number"
                            id="stock"
                            min="0"
                            required
                        >
                    </p>

                    <p>
                        <label for="location">Plats</label><br>
                        <input type="text" id="location" required>
                    </p>

                    <p>
                        <button type="submit">
                            Spara ändringar
                        </button>
                    </p>
                </form>

                <p id="message">Laddar produkt...</p>
            </section>
        `;

    this.form = this.querySelector("#edit-product-form");
    this.nameInput = this.querySelector("#name");
    this.stockInput = this.querySelector("#stock");
    this.locationInput = this.querySelector("#location");
    this.message = this.querySelector("#message");

    this.form.addEventListener("submit", (event) => {
      this.handleSubmit(event);
    });
  }

  async loadProduct() {
    try {
      if (!this.productId) {
        throw new Error("Produkt-ID saknas.");
      }

      const response = await fetch(
        `/webapp/kmom/02/backend/router.php?route=product&id=${this.productId}`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP-fel: ${response.status}`);
      }

      this.nameInput.value = result.name;
      this.stockInput.value = result.stock;
      this.locationInput.value = result.location;
      this.message.textContent = "";
    } catch (error) {
      this.message.textContent = `Kunde inte läsa produkten: ${error.message}`;
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    const product = {
      name: this.nameInput.value.trim(),
      stock: Number(this.stockInput.value),
      location: this.locationInput.value.trim(),
    };

    console.log("Skickar:", product);

    try {
      const response = await fetch(
        `/webapp/kmom/02/backend/router.php?route=products&id=${this.productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP-fel: ${response.status}`);
      }

      this.message.textContent = result.message || "Produkten uppdaterades.";
    } catch (error) {
      this.message.textContent = `Kunde inte uppdatera produkten: ${error.message}`;
    }
  }
}
