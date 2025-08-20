"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/services"

type AuthContextType = {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  registerWithGoogleIdToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Usuario>) => void;
  checkUserPermission: (perm: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7283/api";

const LS_USER_KEY = "APP_USER";
const LS_TOKEN_KEY = "APP_TOKEN";

function safeParse<T>(v: string | null): T | null {
  try {
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restaurar sesión desde localStorage
  useEffect(() => {
    const storedUser = safeParse<Usuario>(typeof window !== "undefined" ? localStorage.getItem(LS_USER_KEY) : null);
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const loginWithGoogleIdToken = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/iniciarSesionConGoogle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await res.json(); // { usuario, existeUsuario, mensaje }

      if (!res.ok || !data?.existeUsuario) {
        throw new Error(data?.mensaje || "No fue posible iniciar sesión");
      }      

      // Guardar usuario
      setUser(data.usuario ?? null);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.usuario ?? null));

      router.replace("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithGoogleIdToken = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/registrarseConGoogle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json(); // { usuario, existeUsuario, mensaje }

      if (!res.ok || !data?.existeUsuario) {
        throw new Error(data?.mensaje || "Usuario existente, debe iniciar sesión");
      }      

      // Guardar usuario
      setUser(data.usuario ?? null);
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.usuario ?? null));

      router.replace("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Si tu API tiene endpoint de logout futuro, podrías llamarlo acá.
    // Por ahora sólo limpiamos front.
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
    setUser(null);
    router.replace("/auth/login");
  };

  const updateUser = (patch: Partial<Usuario>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...patch } : prev;
      if (next) localStorage.setItem(LS_USER_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Función para verificar permisos del usuario
  const checkUserPermission = (_perm: string) => {
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
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogleIdToken,
        registerWithGoogleIdToken,
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