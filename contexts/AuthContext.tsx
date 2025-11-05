"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Usuario } from "@/services"
import { ErrorModal } from "@/components/ui/error-modal"
import { validateUserSession } from "@/services/api"

type AuthContextType = {
  user: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  showErrorModal: boolean
  loginWithGoogleIdToken: (idToken: string) => Promise<void>
  registerWithGoogleIdToken: (idToken: string, rolUsuario: number) => Promise<void>
  logout: () => Promise<void>
  updateUser: (patch: Partial<Usuario>) => void
  checkUserPermission: (perm: string) => boolean
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7283/api"

const LS_USER_KEY = "APP_USER"
const LS_TOKEN_KEY = "APP_TOKEN"

function safeParse<T>(v: string | null): T | null {
  try {
    return v ? (JSON.parse(v) as T) : null
  } catch {
    return null
  }
}

const getRoleNameById = (roleId: number): string => {
  switch (roleId) {
    case 16:
      return "Usuario"
    case 2:
      return "Administrador"
    case 3:
      return "Comercio"
    default:
      return "Usuario"
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const router = useRouter()

  // Función para validar la sesión actual
  const checkSession = useCallback(async () => {
    const storedUser = safeParse<Usuario>(typeof window !== "undefined" ? localStorage.getItem(LS_USER_KEY) : null)
    
    if (!storedUser) {
      return
    }
    
    try {
      const isValid = await validateUserSession(storedUser.iD_Usuario)
      
      if (!isValid) {
        setUser(null)
        localStorage.removeItem(LS_USER_KEY)
        localStorage.removeItem(LS_TOKEN_KEY)
        router.push("/auth/login")
      } else {
        console.log("Sesión válida")
      }
    } catch (error) {
      console.error("Error al validar sesión:", error)
    }
  }, [router])

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    const storedUser = safeParse<Usuario>(typeof window !== "undefined" ? localStorage.getItem(LS_USER_KEY) : null)
    setUser(storedUser)
    setIsLoading(false)
    
    // Validar inmediatamente si hay usuario
    if (storedUser) {
      checkSession()
    }
  }, [checkSession])

  // Validar cuando la ventana vuelve a tener foco
  useEffect(() => {
    if (!user) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, checkSession])

  const loginWithGoogleIdToken = async (idToken: string) => {
    setIsLoading(true)
    setError(null)
    setShowErrorModal(false)

    let res: Response

    try {
      res = await fetch(`${API_BASE_URL}/usuarios/iniciarSesionConGoogle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ idToken }),
      })
    } catch (err) {
      const errorMsg = "No se pudo conectar con el servidor"
      setError(errorMsg)
      setShowErrorModal(true)
      setIsLoading(false)
      return
    }

    const data = await res.json()

    if (!res.ok) {
      const errorMsg = data?.mensaje || "No fue posible iniciar sesión"
      setError(errorMsg)
      setShowErrorModal(true)
      setIsLoading(false)
      return
    }

    //Guardar el token JWT que devuelve el backend
    if (data.token) {
      localStorage.setItem(LS_TOKEN_KEY, data.token)
      console.log("Token JWT guardado en localStorage")
    } else {
      console.warn("La respuesta no contiene un token JWT")
    }

    const userWithRole = data.usuario
    if (userWithRole && userWithRole.iD_RolUsuario) {
      if (!userWithRole.rolUsuario) {
        userWithRole.rolUsuario = {
          iD_RolUsuario: userWithRole.iD_RolUsuario,
          descripcion: getRoleNameById(userWithRole.iD_RolUsuario),
          estado: true,
          fechaCreacion: new Date().toISOString(),
        }
      }
    }

    setUser(userWithRole ?? null)
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userWithRole ?? null))

    router.replace("/dashboard")
    setIsLoading(false)
  }

  const registerWithGoogleIdToken = async (idToken: string, rolUsuario: number) => {
    setIsLoading(true)
    setError(null)
    setShowErrorModal(false)

    let res: Response

    try {
      res = await fetch(`${API_BASE_URL}/usuarios/registrarseConGoogle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ idToken, rolUsuario }),
      })
    } catch (err) {
      const errorMsg = "No se pudo conectar con el servidor"
      setError(errorMsg)
      setShowErrorModal(true)
      setIsLoading(false)
      return
    }

    const data = await res.json()

    if (!res.ok) {
      const errorMsg = data?.mensaje || "No se pudo completar el registro"
      setError(errorMsg)
      setShowErrorModal(true)
      setIsLoading(false)
      return
    }

    //CAMBIO CRÍTICO: Guardar el token JWT que devuelve el backend
    if (data.token) {
      localStorage.setItem(LS_TOKEN_KEY, data.token)
      console.log("Token JWT guardado en localStorage")
    } else {
      console.warn("La respuesta no contiene un token JWT")
    }

    const userWithRole = data.usuario
    if (userWithRole) {
      if (!userWithRole.iD_RolUsuario) {
        userWithRole.iD_RolUsuario = 1
      }

      userWithRole.rolUsuario = {
        iD_RolUsuario: userWithRole.iD_RolUsuario,
        descripcion: getRoleNameById(userWithRole.iD_RolUsuario),
        estado: true,
        fechaCreacion: new Date().toISOString(),
      }
    }

    setUser(userWithRole ?? null)
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userWithRole ?? null))

    router.replace("/dashboard")
    setIsLoading(false)
  }

  const logout = async () => {
    localStorage.removeItem(LS_USER_KEY)
    localStorage.removeItem(LS_TOKEN_KEY)
    setUser(null)
    router.replace("/auth/login")
  }

  const updateUser = (patch: Partial<Usuario>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...patch } : prev
      if (next) localStorage.setItem(LS_USER_KEY, JSON.stringify(next))
      return next
    })
  }

  const checkUserPermission = (perm: string) => {
    if (!user) return false

    const userRoleId = user.iD_RolUsuario || user.rolUsuario?.iD_RolUsuario
    const userRole = getRoleNameById(userRoleId || 1)

    const rolePermissions: Record<string, string[]> = {
      Administrador: [
        "users.manage",
        "roles.manage",
        "comercios.manage",
        "tipos-comercio.manage",
        "resenias.manage",
        "reservas.manage",
        "publicidades.manage",
        "profile.view",
      ],
      Comercio: [
        "comercios.view",
        "reservas.view",
        "publicidades.view",
        "profile.view",
      ],
      Usuario: [
        "reservas.view",
        "resenias.view",
        "profile.view",
      ],
    }

    const hasPermission = rolePermissions[userRole]?.includes(perm) ?? false
    return hasPermission
  }

  const clearError = () => {
    setError(null)
    setShowErrorModal(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        showErrorModal,
        loginWithGoogleIdToken,
        registerWithGoogleIdToken,
        logout,
        updateUser,
        checkUserPermission,
        clearError,
      }}
    >
      {children}
      <ErrorModal
        isOpen={showErrorModal}
        errorMessage={error ?? "Ha ocurrido un error"}
        onClose={clearError}
      />
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}