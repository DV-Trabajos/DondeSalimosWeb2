import { usuarioService } from "@/services"

/**
 * Genera un nombre de usuario único basado en el correo electrónico
 * @param email Correo electrónico del usuario
 * @returns Nombre de usuario único
 */
export async function generateUniqueUsername(email: string): Promise<string> {
  // Extraer la parte del correo antes del @
  const baseUsername = email.split("@")[0]

  try {
    // Obtener todos los usuarios para verificar si el nombre ya existe
    const allUsers = await usuarioService.getAll()

    // Verificar si el nombre base ya existe
    const usernameExists = allUsers.some((user) => user.nombreUsuario.toLowerCase() === baseUsername.toLowerCase())

    if (!usernameExists) {
      return baseUsername // Si no existe, usar el nombre base
    }

    // Si existe, agregar un sufijo numérico
    let counter = 1
    let newUsername = `${baseUsername}${counter}`

    // Buscar un nombre disponible incrementando el contador
    while (allUsers.some((user) => user.nombreUsuario.toLowerCase() === newUsername.toLowerCase())) {
      counter++
      newUsername = `${baseUsername}${counter}`
    }

    return newUsername
  } catch (error) {
    console.error("Error al generar nombre de usuario único:", error)
    // En caso de error, agregar un timestamp para garantizar unicidad
    return `${baseUsername}_${Date.now().toString().slice(-4)}`
  }
}
