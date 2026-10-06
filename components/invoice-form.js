import { getOrders, createInvoice } from "../services/lager-api.js";
import { showToast } from "../utils/toast.js";

const money = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" });

function datePlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default class InvoiceForm extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `<p>Laddar ordrar...</p>`;

    let orders;
    try {
      orders = await getOrders("ny"); // bara ofakturerade ordrar
    } catch (error) {
      console.error(error);
      this.innerHTML = `<p role="alert">Kunde inte hämta ordrar.</p>`;
      return;
    }

    if (orders.length === 0) {
      this.innerHTML = `
        <div class="card">
          <h2 class="section-title">Ny faktura</h2>
          <p>Det finns inga ofakturerade ordrar.</p>
          <a href="#/invoices">Till fakturor</a>
        </div>
      `;
      return;
    }

    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Ny faktura</h2>

        <form id="invoiceForm" class="form" novalidate>
          <label for="order_id">Order</label>
          <select id="order_id" name="order_id" required></select>

          <p id="orderSummary" class="order-summary" aria-live="polite"></p>

          <label for="due_date">Förfallodatum</label>
          <input type="date" id="due_date" name="due_date" required>

          <p id="errorBox" class="error" role="alert"></p>

          <div class="btn-row">
            <button type="submit" class="primary-btn">Skapa faktura</button>
            <button type="button" class="secondary-btn" id="cancelBtn">Avbryt</button>
          </div>
        </form>
      </div>
    `;

    const form = this.querySelector("#invoiceForm");
    const errorBox = this.querySelector("#errorBox");
    const summary = this.querySelector("#orderSummary");
    const submitBtn = form.querySelector("button[type='submit']");
    const select = form.elements.order_id;
    const byId = new Map(orders.map((o) => [String(o.id), o]));

    select.add(new Option("Välj order", ""));
    for (const o of orders) {
      select.add(new Option(`#${o.id} – ${o.customer} – ${money.format(o.total)}`, o.id));
    }
    form.elements.due_date.value = datePlusDays(30);

    select.addEventListener("change", () => {
      const o = byId.get(select.value);
      summary.textContent = o
        ? `${o.quantity} st ${o.product_name} à ${money.format(o.unit_price)} = ${money.format(o.total)}`
        : "";
    });

    this.querySelector("#cancelBtn").addEventListener("click", () => {
      window.location.hash = "#/invoices";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (submitBtn.disabled) return; // skydd mot dubbelklick
      errorBox.textContent = "";

      const order_id = Number(select.value);
      const due_date = form.elements.due_date.value;

      const errors = [];
      if (!Number.isInteger(order_id) || order_id < 1) errors.push("Välj en order.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) errors.push("Ange ett giltigt förfallodatum.");
      if (errors.length > 0) {
        errorBox.textContent = errors.join(" ");
        return;
      }

      submitBtn.disabled = true;
      try {
        await createInvoice({ order_id, due_date });
        showToast("Faktura skapad!");
        window.location.hash = "#/invoices";
      } catch (error) {
        console.error(error);
        if (error.status === 409) {
          errorBox.textContent = "Ordern är redan fakturerad. Ladda om sidan.";
          // Ta bort ordern ur listan så den inte kan väljas igen
          select.querySelector(`option[value="${order_id}"]`)?.remove();
          select.value = "";
          summary.textContent = "";
        } else {
          errorBox.textContent = "Kunde inte skapa fakturan. Försök igen.";
        }
        submitBtn.disabled = false;
      }
    });
  }
}

customElements.define("invoice-form", InvoiceForm);
