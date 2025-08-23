import { usuarioService } from "@/services"

/**
 * Genera un nombre de usuario único basado en el correo electrónico
 * @param email Correo electrónico del usuario
 * @returns Nombre de usuario único
 */
export async function generateUniqueUsername(email: string): Promise<string> {
  // Extraer la parte del correo antes del @
  const baseUsername = email.split("@")[0]
  let username = baseUsername
  let counter = 0

  try {
    while (await usuarioService.exists(username)) {
      counter++
      username = `${baseUsername}${counter}`
    }

    return username
  } catch (error) {
    console.error("Error al generar nombre de usuario único:", error)
    // En caso de error, agregar un timestamp para garantizar unicidad
    return `${baseUsername}_${Date.now().toString().slice(-4)}`
  }
}
