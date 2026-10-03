"use strict";

export default class DeliveriesPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.loadDeliveries();
  }

  render() {
    this.innerHTML = `
      <section class="deliveries-page">
        <h2>Inleveranser</h2>
        <p id="message">Laddar inleveranser...</p>
        <ul id="deliveries-list" class="deliveries-list"></ul>
      </section>
    `;

    this.message = this.querySelector("#message");
    this.list = this.querySelector("#deliveries-list");
  }

  async loadDeliveries() {
    try {
      const response = await fetch(
        "/webapp/kmom/02/backend/router.php?route=deliveries",
      );

      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`);
      }

      const deliveries = await response.json();

      if (!Array.isArray(deliveries) || deliveries.length === 0) {
        this.message.textContent = "Inga inleveranser hittades.";
        this.list.innerHTML = "";
        return;
      }

      this.message.textContent = "";
      this.list.innerHTML = deliveries
        .map(
          (delivery) => `
            <li class="delivery-item">
              <strong>ID:</strong> ${delivery.id}<br>
              <strong>Produkt-ID:</strong> ${delivery.productId}<br>
              <strong>Antal:</strong> ${delivery.quantity}<br>
              <strong>Leveransdatum:</strong> ${delivery.delivery_date}<br>
              <strong>Kommentar:</strong> ${delivery.comment}<br>
              <strong>Skapad:</strong> ${delivery.createdAt}
            </li>
          `,
        )
        .join("");
    } catch (error) {
      this.message.textContent = `Kunde inte ladda inleveranser: ${error.message}`;
      this.list.innerHTML = "";
    }
  }
}
