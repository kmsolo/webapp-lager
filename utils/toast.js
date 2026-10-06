export function showToast(message, type = "success") {
  const toastContainer = document.querySelector("#toast");
  if (!toastContainer) return;

  const div = document.createElement("div");
  div.className = `toast-message toast-${type}`;
  div.textContent = message;
  if (type === "error") div.setAttribute("role", "alert");

  toastContainer.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}
