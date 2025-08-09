import * as admin from "firebase-admin"

// Variable para almacenar la instancia de Firebase Admin
let firebaseAdmin: admin.app.App | undefined

// Función para inicializar y obtener Firebase Admin
export function getFirebaseAdmin(): admin.app.App {
  // Si ya está inicializado, devolver la instancia existente
  if (firebaseAdmin) {
    return firebaseAdmin
  }

  // Verificar si estamos en un entorno de servidor
  if (typeof window !== "undefined") {
    throw new Error("Firebase Admin solo puede inicializarse en el servidor")
  }

  try {
    // Verificar si ya hay aplicaciones inicializadas
    const apps = admin.apps
    if (apps.length > 0) {
      const existingApp = apps[0]
      if (existingApp) {
        firebaseAdmin = existingApp
        return existingApp
      }
    }

    // Obtener las credenciales de las variables de entorno
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_PRIVATE_KEY

    // Verificar que las credenciales estén disponibles
    if (!projectId || !clientEmail || !privateKey) {
      console.error("Faltan credenciales de Firebase Admin:", {
        projectId: !!projectId,
        clientEmail: !!clientEmail,
        privateKey: !!privateKey,
      })
      throw new Error("Faltan credenciales de Firebase Admin. Verifica las variables de entorno.")
    }

    // Reemplazar los caracteres de escape en la clave privada
    privateKey = privateKey.replace(/\\n/g, "\n")

    // Inicializar la aplicación con las credenciales
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })

    console.log("Firebase Admin inicializado correctamente")
    firebaseAdmin = app
    return app
  } catch (error) {
    console.error("Error al inicializar Firebase Admin:", error)
    throw new Error(`No se pudo inicializar Firebase Admin: ${error}`)
  }
}

// Función para eliminar un usuario de Firebase usando Admin SDK
export async function deleteFirebaseUserAdmin(uid: string): Promise<void> {
  try {
    const app = getFirebaseAdmin()
    const auth = admin.auth(app)
    await auth.deleteUser(uid)
    console.log(`Usuario con UID ${uid} eliminado correctamente de Firebase`)
  } catch (error: any) {
    console.error(`Error al eliminar usuario con UID ${uid} de Firebase:`, error)
    throw new Error(`Error al eliminar usuario de Firebase: ${error.message}`)
  }
}

// Función para verificar si un usuario existe en Firebase
export async function checkUserExists(uid: string): Promise<boolean> {
  try {
    const app = getFirebaseAdmin()
    const auth = admin.auth(app)
    await auth.getUser(uid)
    return true
  } catch (error) {
    return false
  }
}
