// Hjälpfunktioner för felmeddelanden i formulär.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Visar ett felmeddelande direkt under ett fält och markerar fältet för skärmläsare
export function setFieldError(input, message) {
  const id = `${input.id}-error`;
  let el = input.form.querySelector(`#${id}`);
  if (!el) {
    el = document.createElement("p");
    el.id = id;
    el.className = "field-error";
    input.after(el);
  }
  el.textContent = message;
  input.setAttribute("aria-invalid", "true");
  input.setAttribute("aria-describedby", id);
}

export function clearErrors(form, errorBox) {
  form.querySelectorAll(".field-error").forEach((el) => el.remove());
  form.querySelectorAll("[aria-invalid]").forEach((input) => {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  });
  if (errorBox) errorBox.textContent = "";
}

// problems: lista av [inputElement, meddelande]
export function showProblems(errorBox, problems) {
  for (const [input, message] of problems) setFieldError(input, message);
  const n = problems.length;
  errorBox.textContent =
    n === 1
      ? "Det finns ett fel i formuläret. Rätta det markerade fältet."
      : `Det finns ${n} fel i formuläret. Rätta de markerade fälten.`;
  problems[0][0].focus();
}

// Begriplig text för fel som inte hör till ett visst fält
export function requestErrorMessage(error) {
  if (error.status === undefined) {
    return "Kunde inte nå servern. Kontrollera anslutningen och försök igen.";
  }
  if (error.status === 429) return "För många försök. Vänta en stund och försök igen.";
  if (error.status >= 500) return "Något gick fel på servern. Försök igen om en stund.";
  return error.message || "Något gick fel. Försök igen.";
}

// Lägger en "Visa lösenord"-ruta efter sista lösenordsfältet
export function addShowPassword(...inputs) {
  const label = document.createElement("label");
  label.className = "show-pw";
  const box = document.createElement("input");
  box.type = "checkbox";
  label.append(box, " Visa lösenord");
  inputs[inputs.length - 1].after(label);
  box.addEventListener("change", () => {
    for (const input of inputs) input.type = box.checked ? "text" : "password";
  });
}
