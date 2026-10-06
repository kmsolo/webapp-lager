"use strict";

export default class NewDeliveryPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.loadProducts();
  }

  render() {
    this.innerHTML = `
      <section class="new-delivery-page">
        <h2>Ny inleverans</h2>

        <form id="new-delivery-form">
          <label class="input-label" for="productId">Produkt</label>
          <select class="input" id="productId" name="productId" required>
            <option value="" selected disabled>Välj produkt</option>
          </select>

          <label class="input-label" for="quantity">Antal</label>
          <input class="input" type="number" id="quantity" name="quantity" min="1" required>

          <label class="input-label" for="delivery_date">Leveransdatum</label>
          <input class="input" type="date" id="delivery_date" name="delivery_date" required>

          <label class="input-label" for="comment">Kommentar</label>
          <textarea class="input" id="comment" name="comment" rows="4">Ingen kommentar</textarea>

          <button class="button green-button" type="submit">Spara inleverans</button>
        </form>

        <p id="message"></p>
      </section>
    `;

    this.form = this.querySelector("#new-delivery-form");
    this.message = this.querySelector("#message");
    this.productSelect = this.querySelector("#productId");

    this.form.addEventListener("submit", this.handleSubmit.bind(this));
  }

  async loadProducts() {
    try {
      const response = await fetch(
        "/webapp/kmom/02/backend/router.php?route=products",
      );

      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`);
      }

      const products = await response.json();

      this.productSelect.innerHTML = `
        <option value="" selected disabled>Välj produkt</option>
        ${products
          .map(
            (product) => `
              <option value="${product.id}">${product.name}</option>
            `,
          )
          .join("")}
      `;
    } catch (error) {
      this.message.textContent = `Kunde inte ladda produkter: ${error.message}`;
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(this.form));

    try {
      const response = await fetch(
        "/webapp/kmom/02/backend/router.php?route=deliveries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: Number(formData.productId),
            quantity: Number(formData.quantity),
            delivery_date: formData.delivery_date,
            comment: formData.comment,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kunde inte spara inleveransen.");
      }

      location.hash = "#deliveries";
    } catch (error) {
      this.message.textContent = error.message;
    }
  }
}
