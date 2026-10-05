const EVERYTHING_URL = "https://lager.emilfolino.se/v2/products/everything";

export default class TotalLager extends HTMLElement {
  constructor() {
    super();

    this.products = [];
    this.filteredProducts = [];
    this.currentPage = 1;
    this.productsPerPage = 25;
  }

  connectedCallback() {
    this.renderLayout();
    this.loadProducts();
  }

  renderLayout() {
    this.innerHTML = `
    <div class="content-card">
            <section class="total-lager">
                <h1>Hela Emil Folinos lager</h1>

                <p>
                    <a
                        href="${EVERYTHING_URL}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Öppna hela lagret som JSON
                    </a>
                </p>

                <label for="search-products">
                    Sök bland alla produkter
                </label>

                <input
                    id="search-products"
                    type="search"
                    placeholder="Namn, artikelnummer eller plats"
                >

                <p class="status">
                    Laddar hela lagret...
                </p>

                <div class="pagination pagination-top"></div>

                <div class="lager-content"></div>

                <div class="pagination pagination-bottom"></div>
            </section>
        </div>
        `;

    this.querySelector("#search-products").addEventListener(
      "input",
      (event) => {
        this.searchProducts(event.target.value);
      },
    );
  }

  async loadProducts() {
    const status = this.querySelector(".status");

    try {
      const response = await fetch(EVERYTHING_URL);

      if (!response.ok) {
        throw new Error(`HTTP-fel: ${response.status}`);
      }

      const result = await response.json();

      this.products = Array.isArray(result) ? result : result.data;

      if (!Array.isArray(this.products)) {
        throw new Error("API-svaret innehåller ingen produktlista.");
      }

      this.filteredProducts = this.products;

      status.textContent = `${this.products.length} produkter hämtades.`;

      this.renderPage();
    } catch (error) {
      console.error("Kunde inte hämta hela lagret:", error);

      status.textContent = "Det gick inte att hämta hela lagret.";

      this.querySelector(".lager-content").innerHTML = `
                <p class="error">
                    ${this.escapeHtml(error.message)}
                </p>
            `;
    }
  }

  searchProducts(searchTerm) {
    const search = searchTerm.toLowerCase().trim();

    this.filteredProducts = this.products.filter((product) => {
      const searchableText = [
        product.id,
        product.name,
        product.article_number,
        product.location,
        product.description,
        product.specifiers,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });

    this.currentPage = 1;
    this.renderPage();
  }

  renderPage() {
    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage,
    );

    if (totalPages === 0) {
      this.currentPage = 1;
    } else if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.productsPerPage;

    const endIndex = startIndex + this.productsPerPage;

    const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

    const content = this.querySelector(".lager-content");

    if (pageProducts.length === 0) {
      content.innerHTML = `
                <p>Inga produkter hittades.</p>
            `;
    } else {
      content.innerHTML = `
                <div class="table-container">
                    <table class="lager-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Artikelnummer</th>
                                <th>Namn</th>
                                <th>Lager</th>
                                <th>Plats</th>
                                <th>Pris</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${pageProducts
                              .map((product) => {
                                return this.createRow(product);
                              })
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `;
    }

    this.renderPagination(totalPages, ".pagination-top");

    this.renderPagination(totalPages, ".pagination-bottom");

    this.addProductListeners();
  }

  renderPagination(totalPages, selector) {
    const pagination = this.querySelector(selector);

    if (!pagination) {
      return;
    }

    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    pagination.innerHTML = `
            <button
                class="previous-page"
                ${this.currentPage === 1 ? "disabled" : ""}
            >
                Föregående
            </button>

            <span>
                Sida ${this.currentPage} av ${totalPages}
            </span>

            <button
                class="next-page"
                ${this.currentPage === totalPages ? "disabled" : ""}
            >
                Nästa
            </button>
        `;

    pagination.querySelector(".previous-page").addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderPage();
        this.scrollToTable();
      }
    });

    pagination.querySelector(".next-page").addEventListener("click", () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderPage();
        this.scrollToTable();
      }
    });
  }

  addProductListeners() {
    this.querySelectorAll(".product-link").forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;

        this.showProductDetails(productId);
      });
    });
  }

  createRow(product) {
    return `
            <tr>
                <td>${product.id ?? "-"}</td>

                <td>
                    <button
                        class="product-link"
                        data-product-id="${product.id}"
                    >
                        ${this.escapeHtml(product.article_number)}
                    </button>
                </td>

                <td>
                    <button
                        class="product-link"
                        data-product-id="${product.id}"
                    >
                        ${this.escapeHtml(product.name)}
                    </button>
                </td>

                <td>${product.stock ?? 0}</td>

                <td>
                    ${this.escapeHtml(product.location)}
                </td>

                <td>${product.price ?? 0} kr</td>
            </tr>
        `;
  }

  showProductDetails(productId) {
    const product = this.products.find((item) => {
      return String(item.id) === String(productId);
    });

    if (!product) {
      return;
    }

    this.querySelector(".lager-content").innerHTML = `
            <article class="product-details">
                <button class="close-details">
                    Tillbaka till lagerlistan
                </button>

                <h2>${this.escapeHtml(product.name)}</h2>

                <dl>
                    <dt>ID</dt>
                    <dd>${product.id ?? "-"}</dd>

                    <dt>Artikelnummer</dt>
                    <dd>
                        ${this.escapeHtml(product.article_number)}
                    </dd>

                    <dt>Beskrivning</dt>
                    <dd>
                        ${this.escapeHtml(product.description)}
                    </dd>

                    <dt>Specifikationer</dt>
                    <dd>
                        ${this.escapeHtml(product.specifiers)}
                    </dd>

                    <dt>Lagerantal</dt>
                    <dd>${product.stock ?? 0}</dd>

                    <dt>Plats</dt>
                    <dd>
                        ${this.escapeHtml(product.location)}
                    </dd>

                    <dt>Pris</dt>
                    <dd>${product.price ?? 0} kr</dd>
                </dl>
            </article>
        `;

    this.querySelector(".pagination-top").innerHTML = "";
    this.querySelector(".pagination-bottom").innerHTML = "";

    this.querySelector(".close-details").addEventListener("click", () => {
      this.renderPage();
    });
  }

  scrollToTable() {
    this.querySelector(".lager-content").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}
