export default class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <div class="header-inner">
                <a class="brand" href="#">Kmom02 - Router</a>

                <nav class="menu" aria-label="Huvudmeny">
                    <a href="#">Hem</a>
                    <a href="#lager">Lagerlista från vårt lager</a>
                    <a href="#total">Hela lagret från Emil Folino</a>
                    <a href="#om">Om</a>
                    <a href="#kontakt">Kontakt</a>
                    <a href="https://dbwebbyearone.ddev.site:8443/webapp/">
                        Tillbaka till webbappen
                    </a>
                </nav>
            </div>
        `;
  }
}
