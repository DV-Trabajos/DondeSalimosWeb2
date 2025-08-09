// Tipos para Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
          revoke: (email: string, callback: () => void) => void
        }
      }
    }
  }
}

export interface GoogleCredentialResponse {
  credential: string // Este es el ID Token
  select_by: string
}

export interface GoogleUser {
  email: string
  name: string
  picture: string
  sub: string // Google ID
  given_name?: string
  family_name?: string
}

export interface AuthResponse {
  usuario: any
  existeUsuario: boolean
  mensaje: string
  esNuevoUsuario?: boolean
}

export interface AuthError {
  type: "ACCOUNT_NOT_FOUND" | "NETWORK_ERROR" | "SERVER_ERROR" | "INVALID_CREDENTIALS" | "UNKNOWN"
  message: string
  originalError?: string
}

// Función para decodificar el JWT (ID Token) y obtener la información del usuario
export const decodeGoogleCredential = (credential: string): GoogleUser => {
  const base64Url = credential.split(".")[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  )

  return JSON.parse(jsonPayload)
}

// Función principal para iniciar sesión con Google
export const loginWithGoogle = (): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    // Verificar si Google Identity Services está disponible
    if (typeof window === "undefined" || !window.google) {
      const error: AuthError = {
        type: "NETWORK_ERROR",
        message: "Google Identity Services no está disponible. Verifica tu conexión a internet.",
        originalError: "Google SDK not loaded",
      }
      reject({ authError: error })
      return
    }

    // Verificar que el client_id esté disponible
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    console.log("🔑 Google Client ID:", clientId ? "✅ Configurado" : "❌ No encontrado")

    if (!clientId) {
      const error: AuthError = {
        type: "NETWORK_ERROR",
        message: "Google Client ID no está configurado. Verifica tu archivo .env.local",
        originalError: "Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID",
      }
      reject({ authError: error })
      return
    }

    // Configurar Google Identity Services con FedCM deshabilitado
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: GoogleCredentialResponse) => {
        try {
          console.log("🚀 Respuesta de Google recibida")

          // Decodificar el credential para obtener información del usuario
          const userInfo = decodeGoogleCredential(response.credential)
          console.log("👤 Información del usuario de Google:", userInfo)

          // Enviar el ID token a nuestro backend
          console.log("📡 Enviando ID token a la API...")
          const apiUrl = "https://localhost:7283/api/usuarios/iniciarSesionConGoogle"

          const apiResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: response.credential,
            }),
          })

          console.log("📊 Respuesta de la API:", {
            status: apiResponse.status,
            statusText: apiResponse.statusText,
          })

          const responseText = await apiResponse.text()

          if (!apiResponse.ok) {
            console.error("❌ Error en la respuesta de la API:", responseText)

            // Intentar parsear como JSON para obtener el mensaje de error
            try {
              const errorData = JSON.parse(responseText)

              // Determinar el tipo de error basado en el mensaje
              let errorType: AuthError["type"] = "UNKNOWN"
              if (errorData.mensaje?.includes("no existe") || errorData.mensaje?.includes("debe registrarse")) {
                errorType = "ACCOUNT_NOT_FOUND"
              } else if (apiResponse.status >= 500) {
                errorType = "SERVER_ERROR"
              } else if (apiResponse.status === 401 || apiResponse.status === 403) {
                errorType = "INVALID_CREDENTIALS"
              }

              const error: AuthError = {
                type: errorType,
                message: errorData.mensaje || `Error ${apiResponse.status}: ${apiResponse.statusText}`,
                originalError: responseText,
              }

              reject({ authError: error })
            } catch (parseError) {
              const error: AuthError = {
                type: "SERVER_ERROR",
                message: `Error ${apiResponse.status}: ${responseText}`,
                originalError: responseText,
              }
              reject({ authError: error })
            }
            return
          }

          // Procesar la respuesta exitosa del backend
          const data: AuthResponse = JSON.parse(responseText)
          console.log("✅ Datos recibidos de la API:", data)

          resolve(data)
        } catch (error: any) {
          console.error("💥 Error al procesar respuesta de Google:", error)

          const authError: AuthError = {
            type: "NETWORK_ERROR",
            message: "Error de conexión con el servidor. Por favor, inténtalo de nuevo.",
            originalError: error.message,
          }

          reject({ authError })
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      // 🔥 CLAVE: Deshabilitar FedCM para evitar conflictos
      use_fedcm_for_prompt: false,
    })

    // Mostrar el prompt de Google con configuración adicional
    window.google.accounts.id.prompt((notification: any) => {
      console.log("📋 Notificación del prompt:", notification)

      if (notification.isNotDisplayed()) {
        console.log("❌ Google prompt no se mostró")
        const error: AuthError = {
          type: "UNKNOWN",
          message: "No se pudo mostrar el diálogo de Google. Inténtalo de nuevo.",
          originalError: `Prompt not displayed: ${notification.getNotDisplayedReason()}`,
        }
        reject({ authError: error })
      } else if (notification.isSkippedMoment()) {
        console.log("⏭️ Google prompt fue omitido")
        const error: AuthError = {
          type: "UNKNOWN",
          message: "El diálogo de Google fue omitido. Inténtalo de nuevo.",
          originalError: `Prompt skipped: ${notification.getSkippedReason()}`,
        }
        reject({ authError: error })
      }
    })
  })
}

// Función para cargar el script de Google Identity Services
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log("✅ Google Identity Services cargado")
      resolve()
    }

    script.onerror = () => {
      console.error("❌ Error al cargar Google Identity Services")
      reject(new Error("Failed to load Google Identity Services"))
    }

    document.head.appendChild(script)
  })
}