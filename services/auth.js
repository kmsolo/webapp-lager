// Token i sessionStorage: försvinner när fliken stängs.
const TOKEN_KEY = "lager_token";
const EMAIL_KEY = "lager_email";

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const getEmail = () => sessionStorage.getItem(EMAIL_KEY);
export const isLoggedIn = () => Boolean(getToken());

export function setSession(token, email) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EMAIL_KEY, email);
  window.dispatchEvent(new Event("authchange"));
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
  window.dispatchEvent(new Event("authchange"));
}
