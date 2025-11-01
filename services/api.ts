export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const LS_USER_KEY = "APP_USER";
const LS_TOKEN_KEY = "APP_TOKEN";

function getAppToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_TOKEN_KEY);
}

// Función para limpiar sesión y redirigir
function clearSessionAndRedirect() {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(LS_USER_KEY);
  localStorage.removeItem(LS_TOKEN_KEY);
  
  // Redirigir al login
  window.location.href = "/auth/login";
}

export async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
  const token = getAppToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    
    // 401 (No autorizado), el usuario fue eliminado o el token es inválido
    if (res.status === 401) {
      console.warn("Usuario no autorizado - Limpiando sesión");
      clearSessionAndRedirect();
      throw new Error("Sesión inválida - Usuario eliminado o token expirado");
    }

    if (!res.ok) {
      const txt = await res.text();
      let msg = `Error ${res.status}`;
      try {
        const j = JSON.parse(txt);
        msg = j.message || j.error || j.Mensaje || msg;
      } catch {}
      throw new Error(msg);
    }

    if (res.status === 204) return;
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
  } catch (error) {
    // Si es error de red y hay usuario logueado, intentar validar
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("Error de red:", error);
    }
    throw error;
  }
}

// Validar la sesión del usuario
export async function validateUserSession(userId: number): Promise<boolean> {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/usuarios/buscarEstadoUsuario/${userId}`);
    
    // Verificar que el usuario existe y está activo
    if (!response || !response.estado) {
      console.warn("Usuario inactivo o eliminado");
      clearSessionAndRedirect();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error validando sesión:", error);
    return false;
  }
}