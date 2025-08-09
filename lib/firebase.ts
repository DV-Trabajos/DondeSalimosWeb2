import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail, 
  signInWithPopup,
  updateProfile,
  deleteUser,
  type User,
  type UserCredential,
} from "firebase/auth"

const getFirebaseConfig = {
  // Verificar si las variables de entorno están definidas
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Inicializar Firebase
const app = initializeApp(getFirebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Configurar el proveedor de Google para seleccionar cuenta
googleProvider.setCustomParameters({
  prompt: "select_account",
})

export interface AuthResponse {
  usuario: any
  esNuevoUsuario: boolean
  //token: string
}

// Interfaz para errores de autenticación más específicos
export interface AuthError {
  type: "ACCOUNT_NOT_FOUND" | "INVALID_CREDENTIALS" | "NETWORK_ERROR" | "SERVER_ERROR" | "UNKNOWN"
  message: string
  originalError?: string
}

// Función para parsear errores de la API
const parseApiError = (errorText: string, status: number): AuthError => {
  const lowerErrorText = errorText.toLowerCase()

  // Errores específicos de la API
  if (
    lowerErrorText.includes("correo no esta registrado") ||
    lowerErrorText.includes("debe crear una cuenta") ||
    lowerErrorText.includes("usuario no encontrado")
  ) {
    return {
      type: "ACCOUNT_NOT_FOUND",
      message: "Tu cuenta de Google no está registrada en nuestro sistema. ¿Te gustaría crear una cuenta nueva?",
      originalError: errorText,
    }
  }

  if (
    lowerErrorText.includes("credenciales") ||
    lowerErrorText.includes("token") ||
    lowerErrorText.includes("autenticación")
  ) {
    return {
      type: "INVALID_CREDENTIALS",
      message: "Hubo un problema con tu autenticación. Por favor, inténtalo de nuevo.",
      originalError: errorText,
    }
  }

  if (status >= 500) {
    return {
      type: "SERVER_ERROR",
      message: "Nuestros servidores están experimentando problemas. Por favor, inténtalo más tarde.",
      originalError: errorText,
    }
  }

  if (status >= 400 && status < 500) {
    return {
      type: "INVALID_CREDENTIALS",
      message: "Hubo un problema con tu solicitud. Por favor, verifica tus datos e inténtalo de nuevo.",
      originalError: errorText,
    }
  }

  return {
    type: "UNKNOWN",
    message: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
    originalError: errorText,
  }
}

export const loginWithGoogle = async (): Promise<AuthResponse | null> => {
  try {
    console.log("Iniciando autenticación con Google...")

    // Iniciar el popup solo para obtener el email (sin autenticar)
    const result = await signInWithPopup(auth, googleProvider)
    const email = result.user.email;

    if (!email) {
      throw new Error("No se pudo obtener el email del usuario de Google.");
    }
    else
    {
      console.log("Autenticación con Google exitosa")
    }

    // Verificar si el usuario ya existe en Firebase
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (!methods || methods.length === 0) {
      // El usuario no tiene cuenta → cerrar sesión y mostrar error
      await auth.signOut();
      throw new Error("El usuario no existe. Debe registrarse primero.");
    }

    // Continuar normalmente: obtener ID token
    const idToken = await result.user.getIdToken();
    console.log(`Token ID obtenido correctamente: ${idToken}`)

    // Información básica del usuario de Google
    const userInfo = {
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid,
    }
    console.log("Información del usuario de Google:", userInfo)
    
    // Enviar el token a nuestro backend
    console.log("Enviando token a la API...")
    const apiUrl = "https://localhost:7283/api/usuarios/iniciarSesionConGoogle"

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    })

    console.log("Respuesta de la API:", {
      status: response.status,
      statusText: response.statusText,
    })

    // Manejar respuesta del backend
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("Error en la respuesta de la API:", responseText);
      
      // Intentar parsear como JSON para obtener el mensaje de error
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
      } catch (parseError) {
        throw new Error(`Error ${response.status}: ${responseText}`);
      }
    }

    // Procesar la respuesta exitosa del backend
    const data: AuthResponse = JSON.parse(responseText);
    console.log("✅ Datos recibidos de la API:", data);

    return data;
    
  } catch (error) {
    console.error("Error completo al autenticar con Google:", error)
    throw error
  }
}

export const registerWithGoogle = async (): Promise<AuthResponse | null> => {
  try {
    console.log("Iniciando autenticación con Google...")

    // 1. Iniciar sesión con Google y obtener credenciales
    const result = await signInWithPopup(auth, googleProvider)
    console.log("Autenticación con Google exitosa")

    // 2. Obtener el token ID de Google
    const idToken = await result.user.getIdToken()
    console.log(`Token ID obtenido correctamente: ${idToken}`)

    // Información básica del usuario de Google
    const userInfo = {
      email: result.user.email,
      displayName: result.user.displayName,
      uid: result.user.uid,
    }
    console.log("Información del usuario de Google:", userInfo)
    
    // 3. Enviar el token a nuestro backend
    console.log("Enviando token a la API...")

    const apiUrl = "https://localhost:7283/api/usuarios/registrarseConGoogle"
    console.log("URL de la API:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    })

    console.log("Respuesta de la API:", {
      status: response.status,
      statusText: response.statusText,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en la respuesta de la API:", errorText)
      throw new Error(`Error en la autenticación: ${errorText}`)
    }

    // 4. Procesar la respuesta del backend
    const data: AuthResponse = await response.json()
    console.log("Datos recibidos de la API:", data)

    return data
    
  } catch (error) {
    console.error("Error completo al autenticar con Google:", error)
    throw error
  }
}

// Función para cerrar sesión
export const logoutUser = async (): Promise<void> => {
  if (!auth) throw new Error("Firebase Auth no está inicializado")

  try {
    await signOut(auth)
  } catch (error: any) {
    console.error("Error al cerrar sesión en Firebase:", error)
    throw new Error(error.message || "Error al cerrar sesión")
  }
}

// Función para enviar correo de restablecimiento de contraseña
export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) throw new Error("Firebase Auth no está inicializado")

  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error("Error al enviar correo de restablecimiento:", error)
    throw new Error(error.message || "Error al enviar correo de restablecimiento")
  }
}

// Función para actualizar el perfil del usuario
export const updateUserProfile = async (user: User, displayName?: string, photoURL?: string): Promise<void> => {
  try {
    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL,
    })
  } catch (error: any) {
    console.error("Error al actualizar perfil:", error)
    throw new Error(error.message || "Error al actualizar perfil")
  }
}

// Función para reenviar correo de verificación
export const resendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user)
  } catch (error: any) {
    console.error("Error al reenviar correo de verificación:", error)
    throw new Error(error.message || "Error al reenviar correo de verificación")
  }
}

// Función para verificar si Firebase está correctamente configurado
export const isFirebaseConfigured = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  return !!apiKey && apiKey.length > 10 // Una API key válida suele tener más de 10 caracteres
}

// Exportar la instancia de auth para usarla en otros componentes
export { auth }
