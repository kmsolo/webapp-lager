export default class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <div class="header-inner">
                
                <nav class="nav-menu"aria-label="Huvudmeny">
                    <a href="#" class="nav-item">Hem</a>
                    <a href="#lager" class="nav-item">Lagerlista från vårt lager</a>
                    <a href="#total" class="nav-item">Hela lagret från Emil Folino</a>
                    <a href="#om" class="nav-item">Om</a>
                    <a href="#kontakt" class="nav-item">Kontakt</a>
                    <a href="https://dbwebbyearone.ddev.site:8443/webapp/" class="nav-item">
                        Tillbaka till webbappen
                    </a>
                </nav>
                
            </div>
        `;
  }
}
