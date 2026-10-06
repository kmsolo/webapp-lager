import { register } from "../services/lager-api.js";
import { showToast } from "../utils/toast.js";
import {
  EMAIL_RE,
  clearErrors,
  setFieldError,
  showProblems,
  requestErrorMessage,
  addShowPassword,
} from "../utils/form-errors.js";

export default class RegisterForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card">
        <h2 class="section-title">Registrera konto</h2>

        <form id="registerForm" class="form" novalidate>
          <label for="email">E-post</label>
          <input type="email" id="email" name="email" autocomplete="username" required>

          <label for="password">Lösenord</label>
          <p class="hint">Minst 8 tecken.</p>
          <input type="password" id="password" name="password" minlength="8" autocomplete="new-password" required>

          <label for="password2">Upprepa lösenord</label>
          <input type="password" id="password2" name="password2" autocomplete="new-password" required>

          <p id="errorBox" class="error" role="alert"></p>

          <button type="submit" class="primary-btn">Skapa konto</button>
        </form>

        <p class="auth-switch">Har du redan ett konto? <a href="#/login">Logga in</a></p>
      </div>
    `;

    const form = this.querySelector("#registerForm");
    const errorBox = this.querySelector("#errorBox");
    const submitBtn = form.querySelector("button[type='submit']");
    const { email: emailInput, password: passwordInput, password2: password2Input } = form.elements;

    addShowPassword(passwordInput, password2Input);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(form, errorBox);

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const password2 = password2Input.value;

      const problems = [];
      if (!email) {
        problems.push([emailInput, "Ange en e-postadress."]);
      } else if (!EMAIL_RE.test(email)) {
        problems.push([emailInput, "E-postadressen ser inte rätt ut. Den ska se ut som namn@exempel.se."]);
      }

      if (!password) {
        problems.push([passwordInput, "Välj ett lösenord."]);
      } else if (password.length < 8) {
        problems.push([passwordInput, `Lösenordet är för kort. Det måste vara minst 8 tecken (du har skrivit ${password.length}).`]);
      } else if (password.length > 72) {
        problems.push([passwordInput, "Lösenordet är för långt. Max 72 tecken."]);
      }

      if (!password2) {
        problems.push([password2Input, "Upprepa lösenordet."]);
      } else if (password && password !== password2) {
        problems.push([password2Input, "Lösenorden är inte likadana. Skriv dem igen."]);
      }

      if (problems.length > 0) {
        showProblems(errorBox, problems);
        return;
      }

      submitBtn.disabled = true;
      try {
        await register(email, password);
        showToast("Konto skapat! Logga in.");
        window.location.hash = "#/login";
      } catch (error) {
        if (error.status === 409) {
          setFieldError(emailInput, "Det finns redan ett konto med den e-postadressen. Logga in i stället.");
          errorBox.textContent = "Kontot kunde inte skapas.";
          emailInput.focus();
        } else if (error.status === 400 && error.field && form.elements[error.field]) {
          setFieldError(form.elements[error.field], error.message);
          errorBox.textContent = "Kontot kunde inte skapas. Rätta det markerade fältet.";
          form.elements[error.field].focus();
        } else {
          errorBox.textContent = requestErrorMessage(error);
        }
        submitBtn.disabled = false;
      }
    });
  }
}

customElements.define("register-form", RegisterForm);
