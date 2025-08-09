"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { auth } from "@/lib/firebase"
import type { Usuario } from "@/services"

interface AuthContextType {
  user: Usuario | null
  firebaseUser: FirebaseUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: Usuario) => void
  logout: () => Promise<void>
  updateUser: (userData: Partial<Usuario>) => void
  checkUserPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem("donde-salimos-user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error("Error al cargar usuario guardado:", error)
        localStorage.removeItem("donde-salimos-user")
      }
    }
  }, [])

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      // Si no hay usuario de Firebase, limpiar el estado
      if (!firebaseUser) {
        setUser(null)
        localStorage.removeItem("donde-salimos-user")
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = (userData: Usuario) => {
    console.log("DENTRO DEL LOGIN: ", userData);
    setUser(userData)
    // Guardar usuario en localStorage para persistencia
    localStorage.setItem("donde-salimos-user", JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setFirebaseUser(null)
      // Limpiar localStorage
      localStorage.removeItem("donde-salimos-user")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    }
  }

  const updateUser = (userData: Partial<Usuario>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      // Actualizar localStorage
      localStorage.setItem("donde-salimos-user", JSON.stringify(updatedUser))
    }
  }

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

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!user && !!firebaseUser,
    isLoading,
    login,
    logout,
    updateUser,
    checkUserPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/auth/login"
    }
  }, [isAuthenticated, isLoading])

  return { isAuthenticated, isLoading }
}