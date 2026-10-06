import { getInvoices } from "../services/lager-api.js";
import { escapeHtml } from "../utils/escape-html.js";

const money = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" });

export default class InvoiceList extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<p>Laddar fakturor...</p>`;

    let invoices;
    try {
      invoices = await getInvoices();
    } catch (error) {
      console.error(error);
      this.innerHTML = `<p role="alert">Kunde inte hämta fakturor.</p>`;
      return;
    }

    // data-label används av CSS för att visa kolumnnamn i kortvyn på mobil
    const rows = invoices
      .map(
        (inv) => `
          <tr>
            <th scope="row" data-label="Fakturanr">${escapeHtml(inv.invoice_number)}</th>
            <td data-label="Kund">${escapeHtml(inv.customer)}</td>
            <td data-label="Order">#${escapeHtml(inv.order_id)}</td>
            <td data-label="Datum">${escapeHtml(inv.created_at)}</td>
            <td data-label="Förfaller">${escapeHtml(inv.due_date)}</td>
            <td data-label="Belopp" class="num">${escapeHtml(money.format(inv.amount))}</td>
          </tr>
        `,
      )
      .join("");

    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Fakturor</h2>

        ${
          invoices.length === 0
            ? `<p>Inga fakturor ännu.</p>`
            : `
          <div class="table-wrap">
            <table class="invoice-table">
              <caption class="sr-only">Lista över fakturor</caption>
              <thead>
                <tr>
                  <th scope="col">Fakturanr</th>
                  <th scope="col">Kund</th>
                  <th scope="col">Order</th>
                  <th scope="col">Datum</th>
                  <th scope="col">Förfaller</th>
                  <th scope="col" class="num">Belopp</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`
        }

        <a class="primary-btn btn-link" href="#/new-invoice">Ny faktura</a>
      </div>
    `;
  }
}

customElements.define("invoice-list", InvoiceList);
