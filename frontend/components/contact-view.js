export default class ContactView extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <section class="view">
                <h1>Kontakt</h1>
                <p>Här hittar du kontaktinformation.</p>
                <p>Du kan kontakta mig via e-post: <a href="mailto:kmsolo@outlook.com">kenneth.magnusson@otlook.com</a></p>
                <p>Du kan även kontakta mig via telefon: <a href="tel:+46701234567">+46 70 123 45 67</a></p>
                <p>Du kan även kontakta mig via sociala medier:</p>
                <ul>
                    <li><a href="https://twitter.com" target="_blank">Twitter</a></li>
                    <li><a href="https://facebook.com" target="_blank">Facebook</a></li>
                    <li><a href="https://linkedin.com" target="_blank">LinkedIn</a></li>
                    <li><a href="https://github.com/kmsolo" target="_blank">GitHub</a></li>
                </ul>
            </section>
        `;
  }
}
