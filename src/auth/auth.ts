const SESSION_KEY = "gestion_ruta_auth";

export function isAuthenticated(): boolean {
  return localStorage.getItem(SESSION_KEY) === "true";
}

export function login(): void {
  localStorage.setItem(SESSION_KEY, "true");
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
