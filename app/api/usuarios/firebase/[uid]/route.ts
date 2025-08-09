import { type NextRequest, NextResponse } from "next/server"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { rolUsuarioService, usuarioService } from "@/services"

export async function DELETE(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    console.log("API: Recibida solicitud para eliminar usuario:", params.uid)

    // Verificar que el usuario esté autenticado
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("API: Error de autenticación - No se proporcionó token")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    if (!token) {
      console.error("API: Error de autenticación - Token vacío")
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
    }

    console.log("API: Token recibido, verificando...")

    // Verificar el token y obtener el usuario actual
    let currentUserUid
    try {
      // Inicializar Firebase Admin
      const app = getFirebaseAdmin()
      const auth = getAuth(app)

      // Verificar el token con Firebase Admin
      const decodedToken = await auth.verifyIdToken(token)
      currentUserUid = decodedToken.uid

      console.log("API: Token verificado correctamente para el usuario:", currentUserUid)
    } catch (error: any) {
      console.error("API: Error al verificar token:", error)
      return NextResponse.json(
        {
          error: "Token inválido",
          details: error.message,
        },
        { status: 401 },
      )
    }

    // Obtener el usuario actual de la base de datos
    console.log("API: Obteniendo información del usuario desde la base de datos")
    const usuarios = await usuarioService.getAll()
    const currentUser = usuarios.find((u) => u.uid === currentUserUid)

    if (!currentUser) {
      console.error("API: Usuario no encontrado en la base de datos:", currentUserUid)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario es administrador
    console.log("API: Verificando rol del usuario")
    const roles = await rolUsuarioService.getAll()
    const userRole = roles.find((r) => r.iD_RolUsuario === currentUser.iD_RolUsuario)

    if (!userRole) {
      console.error("API: Rol no encontrado para el usuario:", currentUser.iD_RolUsuario)
      return NextResponse.json({ error: "Rol de usuario no encontrado" }, { status: 403 })
    }

    console.log("API: Rol del usuario:", userRole.descripcion)

    if (userRole.descripcion !== "Administrador") {
      console.error("API: Usuario no es administrador:", userRole.descripcion)
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 })
    }

    // Eliminar el usuario de Firebase
    const uid = params.uid
    console.log("API: Eliminando usuario de Firebase:", uid)

    try {
      const app = getFirebaseAdmin()
      const auth = getAuth(app)
      await auth.deleteUser(uid)
      console.log("API: Usuario eliminado correctamente de Firebase:", uid)
    } catch (error: any) {
      console.error("API: Error al eliminar usuario de Firebase:", error)
      return NextResponse.json(
        {
          error: `Error al eliminar usuario de Firebase: ${error.message}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API: Error general:", error)
    return NextResponse.json({ error: error.message || "Error al eliminar usuario de Firebase" }, { status: 500 })
  }
}