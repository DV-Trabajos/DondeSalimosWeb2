"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Usuario } from "@/services"

interface AuthContextType {
  user: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>
  updateUser: (userData: Partial<Usuario>) => void
  checkUserPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:7283/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1) Hidratar sesión desde cookie HttpOnly
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/usuarios/me`, {
          method: "GET",
          credentials: "include", // <- envia la cookie
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json(); // { Usuario }
        if (!cancelled) setUser(data.Usuario ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 2) Login con ID Token de Google (sin Firebase)
  const loginWithGoogleIdToken = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/iniciarSesionConGoogle`, {
        method: "POST",
        credentials: "include", // <- importante para recibir Set-Cookie
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Si implementás CSRF double-submit:
          // "X-CSRF-Token": getCsrfTokenFromCookie(),
        },
        body: JSON.stringify({ idToken }), // ajustá si tu API espera otro shape
      });

      const data = await res.json(); // { Usuario, ExisteUsuario, Mensaje }
      if (!res.ok || !data.ExisteUsuario) {
        throw new Error(data?.Mensaje || "No fue posible iniciar sesión");
      }

      // Si el server seteó la cookie, ya estás autenticado.
      setUser(data.Usuario ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  // 3) Logout (invalida la cookie server-side)
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/usuarios/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
    } catch { /* ignore */ }
    finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateUser = (patch: Partial<Usuario>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  // Función para verificar permisos del usuario
  const checkUserPermission = (permission: string): boolean => {
    if (!user) return false

    // Obtener el rol del usuario
    const userRole = user.rolUsuario?.descripcion || "Usuario"

    // Mapeo de permisos basado en roles específicos
    const rolePermissions: Record<string, string[]> = {
      // ADMINISTRADOR: Ve todas las pestañas
      Administrador: [
        "users.manage", // Usuarios
        "roles.manage", // Roles
        "comercios.manage", // Comercios
        "tipos-comercio.manage", // Tipos de Comercio
        "resenias.manage", // Reseñas
        "reservas.manage", // Reservas
        "publicidades.manage", // Publicidades
        "profile.view", // Mi Perfil
      ],

      // COMERCIO: Ve reservas, publicidades y mi perfil
      Comercio: [
        "reservas.view", // Reservas
        "publicidades.view", // Publicidades
        "profile.view", // Mi Perfil
      ],

      // USUARIO: Ve reservas, reseñas y mi perfil
      Usuario: [
        "reservas.view", // Reservas
        "resenias.view", // Reseñas
        "profile.view", // Mi Perfil
      ],
    }

    // Verificar si el rol tiene el permiso específico
    const permissions = rolePermissions[userRole] || []
    return permissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogleIdToken,
        logout,
        updateUser,
        checkUserPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/auth/login"
    }
  }, [isAuthenticated, isLoading])

  return { isAuthenticated, isLoading }
}