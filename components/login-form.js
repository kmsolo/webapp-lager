import { login } from "../services/lager-api.js";
import { setSession } from "../services/auth.js";
import { showToast } from "../utils/toast.js";
import {
  EMAIL_RE,
  clearErrors,
  showProblems,
  requestErrorMessage,
  addShowPassword,
} from "../utils/form-errors.js";

export default class LoginForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Logga in</h2>

        <form id="loginForm" class="form" novalidate>
          <label for="email">E-post</label>
          <input type="email" id="email" name="email" autocomplete="username" required>

          <label for="password">Lösenord</label>
          <input type="password" id="password" name="password" autocomplete="current-password" required>

          <p id="errorBox" class="error" role="alert"></p>

          <button type="submit" class="primary-btn">Logga in</button>
        </form>

        <p class="auth-switch">Saknar du konto? <a href="#/register">Registrera dig</a></p>
      </div>
    `;

    const form = this.querySelector("#loginForm");
    const errorBox = this.querySelector("#errorBox");
    const submitBtn = form.querySelector("button[type='submit']");
    const { email: emailInput, password: passwordInput } = form.elements;

    addShowPassword(passwordInput);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(form, errorBox);

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      const problems = [];
      if (!email) {
        problems.push([emailInput, "Ange din e-postadress."]);
      } else if (!EMAIL_RE.test(email)) {
        problems.push([emailInput, "E-postadressen ser inte rätt ut. Den ska se ut som namn@exempel.se."]);
      }
      if (!password) problems.push([passwordInput, "Ange ditt lösenord."]);

      if (problems.length > 0) {
        showProblems(errorBox, problems);
        return;
      }

      submitBtn.disabled = true;
      try {
        const data = await login(email, password);
        setSession(data.token, data.email);
        showToast("Inloggad!");
        window.location.hash = "#/products";
      } catch (error) {
        if (error.status === 401) {
          // Avsiktligt allmänt: avslöjar inte om e-postadressen finns
          errorBox.textContent =
            "Fel e-post eller lösenord. Kontrollera stavningen (du kan visa lösenordet) och försök igen.";
          passwordInput.value = "";
          passwordInput.focus();
        } else {
          errorBox.textContent = requestErrorMessage(error);
        }
        submitBtn.disabled = false;
      }
    });
  }
}

customElements.define("login-form", LoginForm);
