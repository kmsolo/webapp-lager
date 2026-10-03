"use strict";

export default class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <div class="header-inner">
                <h1>Kmom03 CRUD Lagerapp</h1>

                <nav class="app-nav">
                    <a href="#home">Hem</a>
                    <a href="#about">Om</a>
                    <a href="#contact">Kontakt</a>
                    <a href="#products">Produkter</a>
                    <a href="#create">Skapa produkt</a>
                    <a href="#deliveries">Inleveranser</a>
                    <a href="#new-delivery">Ny inleverans</a>
                    <a href="https://dbwebbyearone.ddev.site:8443/webapp/">Till Webapp</a>    
                </nav>
                
            </header>
        `;
  }
}
