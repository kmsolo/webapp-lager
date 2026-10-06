"use strict";

export default class CreateProduct extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <section class="create-product">
                <h2>Skapa produkt</h2>

                <form id="create-form">
                    <p>
                        <label for="name">Namn</label><br>
                        <input type="text" id="name" name="name" required>
                    </p>

                    <p>
                        <label for="stock">Lager</label><br>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            min="0"
                            value="0"
                            required
                        >
                    </p>

                    <p>
                        <label for="location">Plats</label><br>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            required
                        >
                    </p>

                    <p>
                        <button type="submit">Skapa produkt</button>
                    </p>
                </form>

                <div id="message"></div>
            </section>
        `;

    const form = this.querySelector("#create-form");
    const message = this.querySelector("#message");

    form.addEventListener("submit", (event) => {
      this.handleSubmit(event, message);
    });
  }

  async handleSubmit(event, message) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const product = {
      name: formData.get("name").trim(),
      stock: Number(formData.get("stock")),
      location: formData.get("location").trim(),
    };

    try {
      const response = await fetch(
        "/webapp/kmom/02/backend/router.php?route=products",
        {
          method: "POST",
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

      message.textContent = `Produkten skapades med ID ${result.id}.`;

      event.target.reset();
    } catch (error) {
      message.textContent = `Fel: ${error.message}`;
    }
  }
}
