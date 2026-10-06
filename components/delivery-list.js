import { getDeliveries } from "../services/lager-api.js";
import { escapeHtml } from "../utils/escape-html.js";

export default class DeliveryList extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<p>Laddar inleveranser...</p>`;

    let deliveries;
    try {
      deliveries = await getDeliveries();
    } catch (error) {
      console.error(error);
      this.innerHTML = `<p role="alert">Kunde inte hämta inleveranser.</p>`;
      return;
    }

    const items = deliveries
      .map(
        (del) => `
          <li class="delivery-item">
            <strong>${escapeHtml(del.product_name ?? "Okänd produkt")}</strong><br>
            Antal: ${escapeHtml(del.amount)}<br>
            Datum: ${escapeHtml(del.delivery_date)}
            ${del.comment ? `<br>Kommentar: ${escapeHtml(del.comment)}` : ""}
          </li>
        `,
      )
      .join("");

    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Inleveranser</h2>

        ${
          deliveries.length === 0
            ? `<p>Inga inleveranser ännu.</p>`
            : `<ul class="delivery-list">${items}</ul>`
        }

        <button type="button" class="primary-btn" id="newDeliveryBtn">Ny inleverans</button>
      </div>
    `;

    this.querySelector("#newDeliveryBtn").addEventListener("click", () => {
      window.location.hash = "#/new-delivery";
    });
  }
}

customElements.define("delivery-list", DeliveryList);
